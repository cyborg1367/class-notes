"""Homepage publication contracts: growth, real availability and static output."""
import copy
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from build_assets import render_home_courses,prepare_public_assets


class Summary(HTMLParser):
    def __init__(self,html):
        super().__init__()
        self.cards=[]
        self.links=[]
        self.text=[]
        self.feed(html)

    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag=='article':
            self.cards.append(attrs)
        if tag=='a':
            self.links.append(attrs)

    def handle_data(self,text):
        self.text.append(text)


def course(size):
    return {'id':'course','title':'Course','description':'A course summary.',
            'lessons':[{'id':f'course/note-{i}','title':f'Lesson {i}',
                        'subtitle':f'Topic {i}','number':f'{i:02d}'}
                       for i in range(1,size+1)]}


class HomepageCourseTests(unittest.TestCase):
    def test_ten_notes_keep_one_card_and_only_two_navigation_links(self):
        catalog=[course(10)]
        for i,lesson in enumerate(catalog[0]['lessons']):
            if i<6:
                lesson['lab']={'mission':f'mission-{i}'}
            if i<8:
                lesson['quiz_version']=1
        original=copy.deepcopy(catalog)
        parsed=Summary(render_home_courses(catalog))
        self.assertEqual(len(parsed.cards),1)
        self.assertEqual([a['href'] for a in parsed.links],['course/','course/note-10/'])
        self.assertEqual(parsed.cards[0]['data-note-count'],'10')
        self.assertEqual(parsed.cards[0]['data-lab-count'],'6')
        self.assertEqual(parsed.cards[0]['data-quiz-count'],'8')
        self.assertIn('۱۰',''.join(parsed.text))
        self.assertNotIn('Lesson 1<',render_home_courses(catalog))
        self.assertEqual(catalog,original,'Rendering must not mutate IDs, labs or lesson order')

    def test_latest_is_numeric_and_independent_of_incidental_array_order(self):
        data=course(10)
        data['lessons']=[data['lessons'][9],*data['lessons'][:9]]
        parsed=Summary(render_home_courses([data]))
        self.assertEqual(parsed.cards[0]['data-latest-lesson'],'course/note-10')
        self.assertIn('Lesson 10',''.join(parsed.text))

    def test_missing_exercises_are_not_invented(self):
        data=course(3)
        data['lessons'][0]['quiz_version']=0
        data['lessons'][1]['quiz_version']=2
        parsed=Summary(render_home_courses([data]))
        self.assertEqual(parsed.cards[0]['data-lab-count'],'0')
        self.assertEqual(parsed.cards[0]['data-quiz-count'],'1')
        self.assertEqual(len(parsed.links),2)

    def test_empty_catalog_and_unpublished_empty_courses_do_not_create_fake_notes(self):
        self.assertEqual(len(Summary(render_home_courses([])).cards),0)
        self.assertEqual(len(Summary(render_home_courses([course(0)])).cards),0)
        self.assertNotIn('home-course-new',render_home_courses([]))

    def test_each_course_gets_its_own_destinations_and_heading(self):
        first=course(2)
        second={'id':'another','title':'Another course','lessons':[{'id':'another/start','title':'Start','number':'01'}]}
        html=render_home_courses([first,second])
        parsed=Summary(html)
        self.assertEqual([c['data-home-course'] for c in parsed.cards],['course','another'])
        self.assertEqual([l['href'] for l in parsed.links],['course/','course/note-2/','another/','another/start/'])
        ids=re.findall(r'\bid="([^"]+)"',html)
        self.assertEqual(len(ids),len(set(ids)))

    def test_public_labels_are_escaped_and_foreign_or_traversing_paths_fail(self):
        data=course(1)
        data['title']='<img src=x onerror=alert(1)>'
        data['lessons'][0]['title']='</h4><script>alert(1)</script>'
        html=render_home_courses([data])
        self.assertNotIn('<script>',html)
        self.assertIn('&lt;script&gt;',html)
        for invalid in ['https://evil.example','../other','course/../other']:
            data['lessons'][0]['id']=invalid
            with self.assertRaisesRegex(AssertionError,'public content path'):
                render_home_courses([data])
        data['lessons'][0]['id']='another/note'
        with self.assertRaisesRegex(AssertionError,'different course'):
            render_home_courses([data])

    def test_current_release_shows_real_three_notes_and_third_note_preview(self):
        catalog=json.loads((ROOT/'web/assets/catalog.json').read_text())
        parsed=Summary(render_home_courses(catalog))
        self.assertEqual(len(parsed.cards),1)
        self.assertEqual(parsed.cards[0]['data-latest-lesson'],'machine-learning/evaluating-knn')
        for key in ['data-note-count','data-lab-count','data-quiz-count']:
            self.assertEqual(parsed.cards[0][key],'3')
        self.assertEqual(parsed.links[-1]['href'],'machine-learning/evaluating-knn/')

    def test_summary_html_is_deterministic_and_has_no_runtime_fetch_or_user_state(self):
        catalog=[course(10)]
        self.assertEqual(render_home_courses(catalog),render_home_courses(catalog))
        html=render_home_courses(catalog)
        for forbidden in ['<script','fetch(','supabase','xp_added','localStorage']:
            self.assertNotIn(forbidden,html)

    def test_build_replaces_the_slot_when_the_catalog_grows(self):
        import shutil,tempfile
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            for name in ['build.py','build_assets.py']:
                shutil.copy2(ROOT/name,root/name)
            assets=root/'web/assets'
            assets.mkdir(parents=True)
            (assets/'auth-config.json').write_text('{"supabaseUrl":"","publishableKey":""}')
            (assets/'catalog.json').write_text(json.dumps([course(2)]))
            page=root/'web/index.html'
            page.write_text('<p>Existing header and sign-in control</p><!-- home-courses:start --><!-- home-courses:end --><script id="catalog-data" type="application/json"></script>')
            dist=root/'dist'
            shutil.copytree(root/'web',dist)
            prepare_public_assets(root,dist)
            self.assertEqual(Summary((dist/'index.html').read_text()).cards[0]['data-note-count'],'2')
            (assets/'catalog.json').write_text(json.dumps([course(10)]))
            shutil.rmtree(dist)
            shutil.copytree(root/'web',dist)
            prepare_public_assets(root,dist)
            result=(dist/'index.html').read_text()
            self.assertEqual(Summary(result).cards[0]['data-note-count'],'10')
            self.assertIn('href="course/note-10/"',result)
            self.assertIn('Existing header and sign-in control',result)


if __name__=='__main__':
    unittest.main()

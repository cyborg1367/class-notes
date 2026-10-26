"""Never infer a signed-out state before the persisted session is recovered."""
from html.parser import HTMLParser
from html import unescape
import json
from pathlib import Path
import re
import unittest

ROOT=Path(__file__).resolve().parents[1]


class InitialGate(HTMLParser):
    def __init__(self,source):
        super().__init__()
        self.depth=0
        self.text=[]
        self.links=[]
        self.gates=[]
        self.feed(source)

    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag=='div':
            if self.depth:
                self.depth+=1
            elif 'data-gate' in attrs:
                self.depth=1
                self.gates.append(attrs)
        if self.depth and tag in ['button','a']:
            self.links.append(attrs)

    def handle_endtag(self,tag):
        if tag=='div' and self.depth:
            self.depth-=1

    def handle_data(self,text):
        if self.depth:
            self.text.append(text)


class LoadingShellTests(unittest.TestCase):
    def test_all_lesson_lab_quiz_routes_start_with_neutral_access_placeholders(self):
        catalog=json.loads((ROOT/'web/assets/catalog.json').read_text())
        for course in catalog:
            for lesson in course['lessons']:
                routes=[lesson['id']]
                if lesson.get('lab'):
                    routes.append(lesson['lab']['path'])
                if lesson.get('quiz_version'):
                    routes.append('quiz/'+lesson['id'])
                for route in routes:
                    path=ROOT/'web'/route/'index.html'
                    with self.subTest(route=route):
                        gate=InitialGate(path.read_text())
                        self.assertEqual(len(gate.gates),1)
                        self.assertEqual(gate.gates[0].get('aria-busy'),'true')
                        self.assertEqual(gate.links,[],'Login must appear only after session recovery')
                        self.assertNotIn('ورود',''.join(gate.text))
                        self.assertIn('آماده‌سازی',''.join(gate.text))

    def test_account_initial_html_does_not_claim_the_visitor_is_a_guest(self):
        source=(ROOT/'web/account/index.html').read_text()
        for attribute in ['data-account-guest','data-account-intro-guest','data-account-member','data-account-intro-member']:
            tag=re.search(r'<div\b[^>]*\b'+attribute+r'\b[^>]*>',source)
            self.assertIsNotNone(tag)
            self.assertRegex(tag[0],r'\bhidden\b')

    def test_student_and_teacher_dashboards_have_initial_loading_content(self):
        for name in ['dashboard','instructor']:
            source=(ROOT/'web'/name/'index.html').read_text()
            self.assertIn('class="page-loading"',source)
            self.assertIn('aria-busy="true"',source)

    def test_public_course_does_not_show_login_before_access_has_been_checked(self):
        source=(ROOT/'web/machine-learning/index.html').read_text()
        membership=re.search(r'<div class="course-membership" data-course-membership>(.*?)</div>',source,re.S)[1]
        self.assertNotIn('ورود',membership)
        self.assertNotIn('<a ',membership)
        self.assertIn('بررسی دسترسی',membership)

    def test_lab_loading_trails_identify_their_own_lessons(self):
        catalog=json.loads((ROOT/'web/assets/catalog.json').read_text())
        for course in catalog:
            for lesson in course['lessons']:
                if not lesson.get('lab'):
                    continue
                source=(ROOT/'web'/lesson['lab']['path']/'index.html').read_text()
                title=re.search(r'<span aria-current="page" dir="auto">(.*?)</span>',source)[1]
                self.assertEqual(unescape(title),lesson['title'])


if __name__=='__main__':
    unittest.main()

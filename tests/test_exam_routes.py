from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]

class IndependentExamRouteTests(unittest.TestCase):
    def test_exam_catalog_and_session_are_distinct_authenticated_routes(self):
        catalog = (ROOT / 'web/exams/index.html').read_text(encoding='utf-8')
        session = (ROOT / 'web/exams/machine-learning-midterm/index.html').read_text(encoding='utf-8')
        self.assertIn('data-page="exams"', catalog)
        self.assertIn('data-exams-root', catalog)
        self.assertIn('data-page="exam"', session)
        self.assertIn('data-exam-root', session)
        self.assertIn('data-exam-id="machine-learning-midterm"', session)
        self.assertIn('data-lesson-id="machine-learning"', session)
        self.assertNotIn('data-quiz-root', session)
        self.assertIn('exam.css', catalog)
        self.assertIn('exam.css', session)

    def test_exam_routes_use_separate_rpc_contract_and_never_the_lesson_quiz_grader(self):
        portal = (ROOT / 'frontend/portal/application.mjs').read_text(encoding='utf-8')
        exam_sources = '\n'.join(p.read_text(encoding='utf-8') for p in (ROOT / 'frontend/exam').glob('*.tsx'))
        for name in ['classroom_exams', 'classroom_exam', 'classroom_exam_start', 'classroom_exam_save', 'classroom_exam_submit', 'classroom_exam_attempt', 'classroom_exam_feedback']:
            self.assertIn(name, portal)
        self.assertNotIn('classroom_submit', exam_sources)
        self.assertNotIn('classroom_quiz', exam_sources)
        # The post-submit receipt is intentionally allowed to show correct_option.
        # The initial exam-question type must not embed the answer key.
        contract = (ROOT / 'frontend/exam/contracts.ts').read_text(encoding='utf-8')
        before_review = contract.split('export type ExamReview =', 1)[0]
        self.assertNotIn('correct_option', before_review)
        self.assertIn('correct_option', contract)
        self.assertIn('selected_explanation', exam_sources)
        self.assertIn('onFeedback', exam_sources)

    def test_exam_section_is_in_the_shared_navigation_and_course_overview(self):
        shell = (ROOT / 'frontend/shell/shell-model.ts').read_text(encoding='utf-8')
        course = (ROOT / 'frontend/course/CoursePage.tsx').read_text(encoding='utf-8')
        self.assertIn("id: 'exams', label: 'امتحانات'", shell)
        self.assertIn("'exams', 'exam'", shell)
        self.assertIn("hrefFor(course,'exams')", course)

    def test_exam_backend_contract_keeps_keys_server_side(self):
        contract = (ROOT / 'docs/exams-backend-contract.fa.md').read_text(encoding='utf-8')
        self.assertIn('auth.uid()', contract)
        self.assertIn('SECURITY DEFINER', contract)
        self.assertIn('correct_option', contract)
        self.assertIn('هرگز', contract)
        self.assertIn('expires_at', contract)

if __name__ == '__main__':
    unittest.main()

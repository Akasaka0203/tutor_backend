"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useRouter, useParams } from 'next/navigation';

// 仮の課題データ型 (CreateHomeworkPageと共通化)
interface Question {
  id: number;
  type: 'text' | 'choice';
  questionText: string;
  choices?: string[];
}

interface Homework {
  id: number;
  title: string;
  dueDate: string;
  status: '未提出' | '提出済み' | '完了';
  questions: Question[];
  attachmentName?: string; // string | undefined を許容する
}

// 生徒の解答データ型（仮）
interface StudentAnswer {
    questionId: number;
    textAnswer?: string; // 文章解答
    selectedChoiceIndex?: number; // 選択肢解答
}

// 講師の採点データ型（仮）
interface TutorGrading {
    score?: string; // 点数 (例: '80点', 'A', '未採点')
    feedback?: string; // フィードバックコメント
}


// 仮の課題データ（実際のデータはバックエンドから取得します）
const mockHomeworks: Homework[] = [
  {
    id: 1,
    title: '数学I 課題1',
    dueDate: '2025-05-30',
    status: '未提出',
    questions: [
      { id: 101, type: 'text', questionText: '以下の二次方程式を解きなさい。\nx^2 - 5x + 6 = 0' },
      { id: 102, type: 'choice', questionText: '次のうち、素数ではないものはどれですか？', choices: ['2', '3', '7', '9', '11'] }
    ],
    attachmentName: '数学I_問題用紙.pdf',
  },
  {
    id: 2,
    title: '英語リーディング レポート',
    dueDate: '2025-06-05',
    status: '提出済み',
    questions: [
      { id: 201, type: 'text', questionText: '「The Great Gatsby」を読んで、主人公ギャツビーの人物像について論述しなさい。' }
    ],
    attachmentName: 'レポート課題説明.docx',
  },
  {
    id: 3,
    title: '物理基礎 実験レポート',
    dueDate: '2025-05-20',
    status: '完了',
    questions: [
      { id: 301, type: 'text', questionText: '自由落下の実験結果について考察し、レポートを作成しなさい。' }
    ],
    attachmentName: undefined, // null ではなく undefined に修正
  },
];


const HomeworkDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams(); // URLからIDを取得

  const [homework, setHomework] = useState<Homework | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ユーザーのビューを切り替える状態 (true: 講師ビュー, false: 生徒ビュー)
  const [isTutorView, setIsTutorView] = useState(true); // デフォルトは講師ビュー

  // 生徒の解答を管理する状態
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [studentAttachment, setStudentAttachment] = useState<File | null>(null);

  // 講師の採点情報を管理する状態 (実際のシステムでは生徒の提出ごとに持つ)
  const [tutorGrading, setTutorGrading] = useState<TutorGrading>({ score: '未採点', feedback: '' });

  // params.id が undefined の場合の早期リターン
  // params と params.id の両方が存在し、かつ params.id が文字列であることを確認
  if (!params || typeof params.id !== 'string') {
    return (
      <div className="container">
        <Header />
        <div className="main-content">
          <Sidebar />
          <main className="content-area">
            <p className="error-message">エラー: 課題IDが指定されていません。</p>
            <button className="back-btn" onClick={() => router.push('/inventory/tutor/homework')}>
              課題一覧に戻る
            </button>
          </main>
        </div>
      </div>
    );
  }

  const homeworkId = Number(params.id); // params.idがstringであることを保証してからNumberに変換

  useEffect(() => {
    // 実際のアプリケーションでは、ここでAPIから課題データを取得します
    const fetchedHomework = mockHomeworks.find(h => h.id === homeworkId);

    if (fetchedHomework) {
      setHomework(fetchedHomework);
      // 生徒の解答の初期状態を設定（すべての問題に対して空の解答）
      setStudentAnswers(fetchedHomework.questions.map(q => ({
        questionId: q.id,
        ...(q.type === 'text' ? { textAnswer: '' } : { selectedChoiceIndex: undefined })
      })));
    } else {
      setError('課題が見つかりませんでした。');
    }
    setLoading(false);
  }, [homeworkId]); // homeworkIdが変更されたら再実行

  // 生徒の文章解答を更新
  const handleTextAnswerChange = (questionId: number, value: string) => {
    setStudentAnswers(prevAnswers =>
      prevAnswers.map(answer =>
        answer.questionId === questionId ? { ...answer, textAnswer: value } : answer
      )
    );
  };

  // 生徒の選択肢解答を更新
  const handleChoiceAnswerChange = (questionId: number, choiceIndex: number) => {
    setStudentAnswers(prevAnswers =>
      prevAnswers.map(answer =>
        answer.questionId === questionId ? { ...answer, selectedChoiceIndex: choiceIndex } : answer
      )
    );
  };

  // 生徒の添付ファイル変更
  const handleStudentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setStudentAttachment(e.target.files[0]);
    } else {
      setStudentAttachment(null);
    }
  };

  // 生徒が課題を提出するハンドラ
  const handleSubmitHomework = () => {
    // 提出前に簡単なバリデーション（全てのテキスト問題に解答があるかなど）
    const allAnswered = homework?.questions.every(q => {
        const answer = studentAnswers.find(sa => sa.questionId === q.id);
        if (q.type === 'text') {
            return answer?.textAnswer && answer.textAnswer.trim() !== '';
        } else if (q.type === 'choice') {
            return answer?.selectedChoiceIndex !== undefined;
        }
        return false;
    });

    if (!allAnswered) {
        alert('全ての設問に解答してください。');
        return;
    }

    if (confirm('課題を提出しますか？')) {
      console.log('生徒の解答:', studentAnswers);
      console.log('生徒の添付ファイル:', studentAttachment);
      alert('課題が提出されました！');
      // ここで生徒の解答データをAPIに送信する
    }
  };

  // 講師が採点を保存するハンドラ
  const handleSaveGrading = () => {
    if (confirm('採点内容を保存しますか？')) {
        console.log('採点結果:', tutorGrading);
        // ここで採点データをAPIに送信する
        alert('採点内容が保存されました。');
    }
  };


  if (loading) {
    return (
      <div className="container">
        <Header />
        <div className="main-content">
          <Sidebar />
          <main className="content-area">
            <p>課題データを読み込み中...</p>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <Header />
        <div className="main-content">
          <Sidebar />
          <main className="content-area">
            <p className="error-message">{error}</p>
            <button className="back-btn" onClick={() => router.push('/inventory/tutor/homework')}>
              課題一覧に戻る
            </button>
          </main>
        </div>
      </div>
    );
  }

  if (!homework) {
    return null; // データがない場合は何も表示しない
  }

  return (
    <div className="container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <main className="content-area">
          <section className="homework-detail-section">
            <div className="detail-actions-top">
                <button className="back-btn" onClick={() => router.push('/inventory/tutor/homework')}>
                課題一覧に戻る
                </button>
                <div className="view-toggle">
                    <button
                        className={`toggle-btn ${isTutorView ? 'active' : ''}`}
                        onClick={() => setIsTutorView(true)}
                    >
                        講師ビュー
                    </button>
                    <button
                        className={`toggle-btn ${!isTutorView ? 'active' : ''}`}
                        onClick={() => setIsTutorView(false)}
                    >
                        生徒ビュー
                    </button>
                </div>
            </div>


            <div className="homework-header-detail">
              <h2>{homework.title}</h2>
              <p className="homework-meta">提出期限: {homework.dueDate}</p>
            </div>

            <div className="homework-questions-container">
              <h3>問題内容</h3>
              {homework.questions.length === 0 ? (
                <p>この課題には問題が設定されていません。</p>
              ) : (
                homework.questions.map((question, index) => {
                  const currentAnswer = studentAnswers.find(sa => sa.questionId === question.id);
                  return (
                    <div key={question.id} className="question-detail-item">
                      <h4>問 {index + 1}: {question.questionText}</h4>
                      {question.type === 'text' ? (
                        <div className="question-content-text">
                          {isTutorView ? (
                            // 講師ビュー: 生徒の解答を表示 (今回は仮データとして表示)
                            <div className="student-answer-display">
                                <h5>生徒の解答:</h5>
                                <textarea
                                    value={currentAnswer?.textAnswer || '（生徒の解答がまだありません）'}
                                    rows={5}
                                    readOnly // 講師は編集できない
                                    className="student-answer-textarea"
                                ></textarea>
                            </div>
                          ) : (
                            // 生徒ビュー: 解答入力フィールド
                            <textarea
                              placeholder="解答を入力してください。"
                              rows={5}
                              value={currentAnswer?.textAnswer || ''}
                              onChange={(e) => handleTextAnswerChange(question.id, e.target.value)}
                            ></textarea>
                          )}
                        </div>
                      ) : (
                        <div className="question-content-choice">
                          <ul>
                            {question.choices?.map((choice, cIndex) => (
                              <li key={cIndex} className="choice-item">
                                {isTutorView ? (
                                    // 講師ビュー: 生徒の選択肢表示
                                    <input
                                        type="radio"
                                        checked={currentAnswer?.selectedChoiceIndex === cIndex}
                                        readOnly // 講師は変更できない
                                        disabled // 無効化して見た目を表示
                                    />
                                ) : (
                                    // 生徒ビュー: 選択肢ラジオボタン
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`} // 同じnameでグループ化
                                        checked={currentAnswer?.selectedChoiceIndex === cIndex}
                                        onChange={() => handleChoiceAnswerChange(question.id, cIndex)}
                                    />
                                )}
                                <span className="choice-number">{String.fromCharCode(65 + cIndex)}.</span> {choice}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {homework.attachmentName && (
              <div className="homework-attachments">
                <h3>課題添付ファイル</h3>
                <p>
                  <a href="#" onClick={(e) => { e.preventDefault(); alert(`「${homework.attachmentName}」をダウンロードします。`); }} className="download-link">
                    {homework.attachmentName}
                  </a>
                </p>
              </div>
            )}

            {isTutorView ? (
                // 講師ビューのセクション
                <div className="tutor-grading-section">
                    <h3>生徒の提出と採点</h3>
                    <div className="student-submitted-attachment">
                        <h4>生徒提出ファイル:</h4>
                        {/* 実際には生徒が提出したファイル名が表示される */}
                        {studentAttachment ? (
                            <p>
                                <a href="#" onClick={(e) => { e.preventDefault(); alert(`「${studentAttachment.name}」をダウンロードします。`); }} className="download-link">
                                    {studentAttachment.name}
                                </a>
                            </p>
                        ) : (
                            <p>（生徒からの提出ファイルはありません）</p>
                        )}
                    </div>

                    <div className="input-group">
                        <label htmlFor="tutor-score">採点:</label>
                        <input
                            type="text"
                            id="tutor-score"
                            value={tutorGrading.score}
                            onChange={(e) => setTutorGrading({ ...tutorGrading, score: e.target.value })}
                            placeholder="例: 80点, A, 良好"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="tutor-feedback">フィードバック:</label>
                        <textarea
                            id="tutor-feedback"
                            rows={6}
                            value={tutorGrading.feedback}
                            onChange={(e) => setTutorGrading({ ...tutorGrading, feedback: e.target.value })}
                            placeholder="生徒へのフィードバックを入力してください。"
                        ></textarea>
                    </div>
                    <button className="save-grading-btn" onClick={handleSaveGrading}>
                        採点内容を保存
                    </button>
                </div>
            ) : (
                // 生徒ビューのセクション
                <div className="student-submission-section">
                    <h3>解答と提出</h3>
                    <div className="input-group">
                        <label htmlFor="student-attachment">解答ファイル添付:</label>
                        <input
                            type="file"
                            id="student-attachment"
                            onChange={handleStudentFileChange}
                        />
                        {studentAttachment && <p className="selected-file-name">選択中のファイル: {studentAttachment.name}</p>}
                    </div>
                    <button className="submit-homework-btn" onClick={handleSubmitHomework}>
                        課題を提出する
                    </button>
                </div>
            )}

          </section>
        </main>
      </div>
    </div>
  );
};

export default HomeworkDetailPage;
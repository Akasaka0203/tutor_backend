"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';

// 質問の型定義
interface Question {
  id: number;
  title: string;
  content: string;
  attachmentName?: string | null; // 添付ファイル名 (オプションでnullも許容)
  createdAt: string; // 質問作成日
  status: '未回答' | '回答済み'; // 質問の状態を厳密に定義
  answerContent?: string; // 回答内容 (オプション)
  answerAttachmentName?: string | null; // 回答の添付ファイル名 (オプションでnullも許容)
  answeredAt?: string; // 回答日 (オプション)
}

// モックデータ (let で定義し、更新可能にする)
// 実際のアプリケーションでは、APIからデータを取得します
let mockQuestions: Question[] = [
  {
    id: 1,
    title: '数学の二次関数の問題について',
    content: '教科書P.45の例題3が理解できません。特に平方完成のステップがよくわからないです。',
    attachmentName: null,
    createdAt: '2025-05-20',
    status: '未回答',
  },
  {
    id: 2,
    title: '英語長文読解のコツ',
    content: 'いつも時間が足りません。速く正確に読むためのコツがあれば教えてください。',
    attachmentName: 'english_passage_sample.pdf',
    createdAt: '2025-05-18',
    status: '回答済み',
    answerContent: '長文読解のコツは、まず全体を素早く読み、主要なテーマを把握することです。次に、設問を読み、設問に関連する部分を重点的に読み込むと効率的です。また、日頃から多読を心がけ、語彙力を増やすことも重要です。',
    answerAttachmentName: 'reading_tips_sample.docx',
    answeredAt: '2025-05-19',
  },
  {
    id: 3,
    title: '物理の実験レポートの書き方',
    content: '実験結果の考察がうまく書けません。どのような点に注意して書けば良いでしょうか？',
    attachmentName: 'physics_report_template.docx',
    createdAt: '2025-05-15',
    status: '未回答',
  },
];

// ページコンポーネントのProps型定義
interface QuestionDetailPageProps {
  params: {
    id: string; // 動的ルーティングのID (文字列として受け取る)
  };
}

const QuestionDetailPage: React.FC<QuestionDetailPageProps> = ({ params }) => {
  const router = useRouter();
  // URLから取得したIDを数値に変換。params.id が undefined の可能性も考慮して || '' を追加
  const questionId = parseInt(params.id || '', 10);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answerContent, setAnswerContent] = useState<string>('');
  const [answerAttachment, setAnswerAttachment] = useState<File | null>(null);

  useEffect(() => {
    // questionId が有効な数値であるかを確認
    if (!isNaN(questionId)) {
      const foundQuestion = mockQuestions.find(q => q.id === questionId);
      if (foundQuestion) {
        setQuestion(foundQuestion);
        // 既存の回答があれば、回答内容をStateにセット
        if (foundQuestion.answerContent) {
          setAnswerContent(foundQuestion.answerContent);
        }
      } else {
        // 質問が見つからない場合、404ページなどにリダイレクト
        router.push('/404');
      }
    } else {
      // IDが無効な場合もリダイレクト
      router.push('/404');
    }
  }, [questionId, router]); // questionIdとrouterが変更されたらこのエフェクトを再実行

  // 講師が回答を送信するハンドラ
  const handleSubmitAnswer = () => {
    if (!question) return; // 質問データがない場合は何もしない

    if (!answerContent.trim()) {
      alert('回答内容を入力してください。');
      return;
    }

    // モックデータを更新（実際のアプリケーションではAPIを呼び出し、データベースを更新）
    const updatedQuestions = mockQuestions.map(q =>
      q.id === question.id
        ? {
            ...q,
            status: '回答済み', // 回答後、ステータスを「回答済み」に変更
            answerContent: answerContent.trim(),
            answerAttachmentName: answerAttachment ? answerAttachment.name : null,
            answeredAt: new Date().toISOString().slice(0, 10), // 今日の日付を回答日として記録
          }
        : q
    );
    mockQuestions = updatedQuestions; // グローバルなモックデータを更新
    setQuestion(mockQuestions.find(q => q.id === question.id) || null); // 現在の質問も更新してUIに反映
    alert('回答を送信しました！');

    console.log('回答された質問:', mockQuestions.find(q => q.id === question.id));
    if (answerAttachment) {
      console.log('回答添付ファイル:', answerAttachment);
    }
  };

  // 回答添付ファイルが選択された時のハンドラ
  const handleAnswerAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAnswerAttachment(e.target.files[0]);
    } else {
      setAnswerAttachment(null);
    }
  };

  // 質問を削除するハンドラ
  const handleDeleteQuestion = () => {
    if (!question) return; // 質問データがない場合は何もしない
    if (confirm('本当にこの質問を削除しますか？')) {
      // モックデータから該当する質問を削除
      mockQuestions = mockQuestions.filter(q => q.id !== question.id);
      alert('質問を削除しました。');
      router.push('/inventory/tutor/questions'); // 削除後、質問一覧ページに戻る
    }
  };

  // 質問データがまだ読み込まれていない場合の表示
  if (!question) {
    return (
      <div className="container">
        <Header />
        <div className="main-content">
          <Sidebar />
          <main className="content-area">
            <p>質問を読み込み中...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <main className="content-area">
          <section className="question-detail-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <button onClick={() => router.back()} className="back-btn">
                &larr; 質問一覧に戻る
              </button>
              {/* ここから変更点: ステータス表示と削除ボタンをまとめる新しいdivを追加 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}> {/* gapでボタン間のスペースを調整 */}
                <span className={`question-status-detail ${question.status === '未回答' ? 'status-unanswered' : 'status-answered'}`}>
                  {question.status}
                </span>
                <button
                  onClick={handleDeleteQuestion}
                  className="delete-btn"
                  style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}
                >
                  この質問を削除
                </button>
              </div>
              {/* ここまで変更点 */}
            </div>

            <h2>{question.title}</h2>
            {/* このdivからquestion.status関連の要素は削除されました */}
            <div className="question-meta-detail">
              <p>投稿日: {question.createdAt}</p>
              {question.status === '回答済み' && question.answeredAt && (
                <p>回答日: {question.answeredAt}</p>
              )}
            </div>

            <div className="question-content-box">
              <h3>質問内容</h3>
              <p className="question-content-text">{question.content}</p>
              {/* 質問の添付ファイルがあれば表示 */}
              {question.attachmentName && (
                <p className="question-attachment-display">
                  添付ファイル:{' '}
                  {/* 実際にはファイルパスを適切に設定し、download属性でダウンロード可能にする */}
                  <a href={`/path/to/question_attachments/${question.attachmentName}`} download>
                    {question.attachmentName}
                  </a>
                </p>
              )}
            </div>

            <div className="answer-section">
              <h3>回答</h3>
              {question.status === '回答済み' ? (
                // 回答済みの場合、回答内容と添付ファイルを表示
                <div className="answered-content-box">
                  <p className="answered-text">{question.answerContent}</p>
                  {question.answerAttachmentName && (
                    <p className="answered-attachment">
                      添付ファイル:{' '}
                      {/* 実際にはファイルパスを適切に設定し、download属性でダウンロード可能にする */}
                      <a href={`/path/to/answer_attachments/${question.answerAttachmentName}`} download>
                        {question.answerAttachmentName}
                      </a>
                    </p>
                  )}
                </div>
              ) : (
                // 未回答の場合、回答フォームを表示
                <div className="answer-form">
                  <textarea
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    placeholder="ここに回答を入力してください..."
                    rows={10}
                  ></textarea>
                  <div className="input-group">
                    <label htmlFor="answer-attachment">添付ファイル (任意)</label>
                    <input
                      type="file"
                      id="answer-attachment"
                      onChange={handleAnswerAttachmentChange}
                    />
                    {answerAttachment && (
                      <p className="selected-file-name">選択中のファイル: {answerAttachment.name}</p>
                    )}
                  </div>
                  <button onClick={handleSubmitAnswer} className="submit-answer-btn">
                    回答を送信する
                  </button>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default QuestionDetailPage;
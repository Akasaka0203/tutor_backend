// FRONTEND/app/inventory/tutor/questions/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 質問の型定義
interface Question {
  id: number;
  title: string;
  content: string;
  attachmentName?: string | null;
  createdAt: string;
  status: '未回答' | '回答済み'; // ここが重要
  answerContent?: string;
  answerAttachmentName?: string | null;
  answeredAt?: string;
}

// モックデータ (let で定義し、更新可能にする)
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

const QuestionsPage: React.FC = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>(mockQuestions); // mockQuestions を初期値として使用
  const [isCreatingNewQuestion, setIsCreatingNewQuestion] = useState<boolean>(false);
  const [newQuestionTitle, setNewQuestionTitle] = useState<string>('');
  const [newQuestionContent, setNewQuestionContent] = useState<string>('');
  const [newQuestionAttachment, setNewQuestionAttachment] = useState<File | null>(null);

  useEffect(() => {
    // モックデータが更新される可能性があるため、useEffect で初期化または監視
    setQuestions(mockQuestions);
  }, []);

  const handleToggleCreateForm = () => {
    setIsCreatingNewQuestion(prev => !prev);
    if (isCreatingNewQuestion) {
      setNewQuestionTitle('');
      setNewQuestionContent('');
      setNewQuestionAttachment(null);
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewQuestionAttachment(e.target.files[0]);
    } else {
      setNewQuestionAttachment(null);
    }
  };

  const handleSubmitNewQuestion = () => {
    if (!newQuestionTitle.trim() || !newQuestionContent.trim()) {
      alert('タイトルと内容を入力してください。');
      return;
    }

    const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
    const newQuestion: Question = {
      id: newId,
      title: newQuestionTitle.trim(),
      content: newQuestionContent.trim(),
      attachmentName: newQuestionAttachment ? newQuestionAttachment.name : null,
      createdAt: new Date().toISOString().slice(0, 10),
      status: '未回答', // 新規質問は必ず「未回答」
    };

    mockQuestions.push(newQuestion); // グローバルなモックデータを更新
    setQuestions([...mockQuestions]); // ローカルStateを更新してUIに反映

    alert('質問を送信しました！');

    setNewQuestionTitle('');
    setNewQuestionContent('');
    setNewQuestionAttachment(null);
    setIsCreatingNewQuestion(false);

    console.log('新規質問:', newQuestion);
    if (newQuestionAttachment) {
      console.log('添付ファイル:', newQuestionAttachment);
    }
  };

  // 質問を削除するハンドラ
  const handleDeleteQuestion = (id: number) => {
    if (confirm('本当にこの質問を削除しますか？')) {
      mockQuestions = mockQuestions.filter(q => q.id !== id);
      setQuestions([...mockQuestions]); // ローカルStateも更新
      alert('質問を削除しました。');
    }
  };


  return (
    <div className="container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <main className="content-area">
          <section className="questions-section">
            <h2>質問管理</h2>

            <div className="questions-actions">
              <button className="create-question-btn" onClick={handleToggleCreateForm}>
                {isCreatingNewQuestion ? '質問一覧に戻る' : '+ 新しい質問をする'}
              </button>
            </div>

            {isCreatingNewQuestion ? (
              <div className="new-question-form">
                <h3>新規質問作成</h3>
                <div className="input-group">
                  <label htmlFor="question-title">タイトル</label>
                  <input
                    type="text"
                    id="question-title"
                    value={newQuestionTitle}
                    onChange={(e) => setNewQuestionTitle(e.target.value)}
                    placeholder="質問のタイトルを入力してください"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="question-content">内容</label>
                  <textarea
                    id="question-content"
                    value={newQuestionContent}
                    onChange={(e) => setNewQuestionContent(e.target.value)}
                    placeholder="質問の詳細を入力してください"
                    rows={8}
                  ></textarea>
                </div>
                <div className="input-group">
                  <label htmlFor="question-attachment">添付ファイル (任意)</label>
                  <input
                    type="file"
                    id="question-attachment"
                    onChange={handleAttachmentChange}
                  />
                  {newQuestionAttachment && (
                    <p className="selected-file-name">選択中のファイル: {newQuestionAttachment.name}</p>
                  )}
                </div>
                <button className="submit-question-btn" onClick={handleSubmitNewQuestion}>
                  質問を送信する
                </button>
              </div>
            ) : (
              <div className="question-list">
                {questions.length === 0 ? (
                  <p>まだ質問はありません。</p>
                ) : (
                  <ul>
                    {questions.map(question => (
                      <li key={question.id} className="question-item">
                        {/* ここを修正：Linkの中にaタグを直接ネストさせない */}
                        <Link href={`/inventory/tutor/questions/${question.id}`} className="question-item-link">
                          <div className="question-header">
                            <h3>{question.title}</h3>
                            <span className={`question-status ${question.status === '未回答' ? 'status-unanswered' : 'status-answered'}`}>
                              {question.status}
                            </span>
                          </div>
                          <p className="question-meta">
                            投稿日: {question.createdAt}
                          </p>
                          <p className="question-content-preview">
                            {question.content.substring(0, 100)}{question.content.length > 100 ? '...' : ''}
                          </p>
                          {/* 添付ファイルの表示はLinkのクリックイベントをキャンセル */}
                          {question.attachmentName && (
                            <p className="question-attachment">
                              添付ファイル:{' '}
                              {/* onClickでe.preventDefault()を追加し、Linkによる遷移を防ぐ */}
                              <a href={`/path/to/question_attachments/${question.attachmentName}`} onClick={(e) => e.preventDefault()} download>
                                {question.attachmentName}
                              </a>
                            </p>
                          )}
                        </Link>
                        {/* 削除ボタンはLinkの外に配置する */}
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="delete-question-btn"
                          style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
                        >
                          削除
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default QuestionsPage;
"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Linkコンポーネントをインポート

// 仮の課題データ型
// 課題詳細ページと合わせるため、questionsとattachmentNameを追加（実際のデータは未定義でもOK）
interface Homework {
  id: number;
  title: string;
  dueDate: string;
  status: '未提出' | '提出済み' | '完了';
  questions?: any[]; // 詳細画面で使うので、ここにも型定義を追加
  attachmentName?: string;
}

const initialHomeworks: Homework[] = [
  { id: 1, title: '数学I 課題1', dueDate: '2025-05-30', status: '未提出' },
  { id: 2, title: '英語リーディング レポート', dueDate: '2025-06-05', status: '提出済み' },
  { id: 3, title: '物理基礎 実験レポート', dueDate: '2025-05-20', status: '完了' },
];

const HomeworkPage: React.FC = () => {
  const router = useRouter();
  const [homeworks, setHomeworks] = useState<Homework[]>(initialHomeworks);

  const handleCreateHomework = () => {
    router.push('/inventory/tutor/homework/create');
  };

  const handleDeleteHomework = (id: number) => {
    if (confirm('この課題を削除してもよろしいですか？')) {
      setHomeworks(homeworks.filter(homework => homework.id !== id));
      alert('課題を削除しました！');
    }
  };

  // 編集機能は、将来的に課題詳細ページでの編集に繋がる可能性もあるため、今回はアラートのまま
  // `handleEditHomework` 関数は、ボタンが削除されるため不要になりますが、
  // もし将来的に再利用する可能性があれば残しておいても構いません。
  const handleEditHomework = (id: number) => {
    alert(`課題ID: ${id} を編集します（この機能はまだ実装されていません）。`);
  };

  return (
    <div className="container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <main className="content-area">
          <section className="homework-section">
            <h2>課題管理</h2>
            <button className="create-homework-btn" onClick={handleCreateHomework}>
              + 課題を作成する
            </button>

            <div className="homework-list">
              {homeworks.length === 0 ? (
                <p>課題はまだありません。</p>
              ) : (
                <ul>
                  {homeworks.map(homework => (
                    <li key={homework.id} className="homework-item">
                      {/* Linkコンポーネントで課題詳細ページへのリンクを設定 */}
                      {/* homework-item-content を追加して、リンクの内部をスタイルする */}
                      <Link href={`/inventory/tutor/homework/${homework.id}`} className="homework-item-link">
                        <div className="homework-item-content"> {/* このdivを追加または確認 */}
                          <h3>{homework.title}</h3>
                          <p className="homework-meta">
                            提出期限: {homework.dueDate} | ステータス: {homework.status}
                          </p>
                        </div>
                      </Link>
                      <div className="homework-actions">
                        {/* 編集ボタンを完全に削除しました */}
                        {/* <button onClick={() => handleEditHomework(homework.id)}>編集</button> */}
                        <button className="delete-btn" onClick={() => handleDeleteHomework(homework.id)}>削除</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default HomeworkPage;
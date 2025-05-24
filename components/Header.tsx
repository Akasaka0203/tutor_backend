"use client"; // クライアントコンポーネントとしてマーク

import React from 'react';
import { useRouter } from 'next/navigation'; // useRouterをインポート

const Header: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    alert('ログアウトしました。'); // デバッグ用にアラートを表示

    // ★★★ ここを修正します ★★★
    // 正しいログイン画面のパスに修正
    router.push('/inventory/tutor/login'); // /inventory/tutor/login に修正
  };

  return (
    <header className="header">
      <h1>授業管理システム</h1>
      <button className="logout-btn" onClick={handleLogout}>
        ログアウト
      </button>
    </header>
  );
};

export default Header;
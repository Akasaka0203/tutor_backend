"use client"; // クライアントコンポーネントとしてマーク

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  // activeItem プロパティは不要
}

const Sidebar: React.FC<SidebarProps> = () => {
  const pathname = usePathname(); // 現在のパスを取得

  // パスが指定されたプレフィックスで始まるかどうかを判定するヘルパー関数
  const isActive = (pathPrefix: string) => {
    // ★★★ ここを修正します ★★★
    // pathnameがnullでないことを確認してからstartsWithを呼び出す
    return pathname !== null && pathname.startsWith(pathPrefix);
  };

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            {/* メイン画面 */}
            <Link
              href="/inventory/tutor/main"
              passHref
              className={`sidebar-item ${isActive('/inventory/tutor/main') ? 'active' : ''}`}
            >
              メイン画面
            </Link>
          </li>
          <li>
            {/* 課題管理 */}
            <Link
              href="/inventory/tutor/homework"
              passHref
              className={`sidebar-item ${isActive('/inventory/tutor/homework') ? 'active' : ''}`}
            >
              課題管理
            </Link>
          </li>
          <li>
            {/* 質問 */}
            <Link
              href="/inventory/tutor/questions"
              passHref
              className={`sidebar-item ${isActive('/inventory/tutor/questions') ? 'active' : ''}`}
            >
              質問
            </Link>
          </li>
          <li>
            {/* 資料 */}
            <Link
              href="/inventory/tutor/materials"
              passHref
              className={`sidebar-item ${isActive('/inventory/tutor/materials') ? 'active' : ''}`}
            >
              資料
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
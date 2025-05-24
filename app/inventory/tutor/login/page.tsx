"use client"; // このファイルがクライアントサイドでレンダリングされることを示す

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Next.jsのルーターフックをインポート

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const router = useRouter(); // useRouterフックを初期化

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // フォームのデフォルトの送信動作を防止

    // ここに実際の認証ロジックを実装します。
    // 例: APIエンドポイントにユーザー名とパスワードを送信し、認証結果を受け取る。
    // 今回は仮の認証ロジックとして、特定の組み合わせで成功とみなします。
    if (username === 'testuser' && password === 'password') {
      alert('ログイン成功！');
      // ログイン成功後、メイン画面へリダイレクト
      router.push('/inventory/tutor/main');
    } else {
      alert('ユーザー名またはパスワードが間違っています。');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>ログイン</h1>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username">ユーザー名(必須)</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">パスワード(必須)</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">ログイン</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
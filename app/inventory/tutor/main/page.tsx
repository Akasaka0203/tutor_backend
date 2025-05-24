"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Calendar from '@/components/Calendar'; // Calendarコンポーネントをインポート

// 仮のデータ型定義
interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  color?: string;
}

const initialEvents: CalendarEvent[] = [
  {
    id: 1,
    title: '生徒Aとの面談',
    start: new Date(2025, 4, 25, 10, 0), // 月は0から始まるため4は5月
    end: new Date(2025, 4, 25, 11, 0),
    description: '来学期の学習計画について',
    color: '#FFDDC1', // ライトオレンジ
  },
  {
    id: 2,
    title: '全体講師ミーティング',
    start: new Date(2025, 4, 28, 14, 0),
    end: new Date(2025, 4, 28, 15, 30),
    description: '新カリキュラムに関する情報共有',
    color: '#C1E1FF', // ライトブルー
  },
  {
    id: 3,
    title: '個別指導（生徒B）',
    start: new Date(2025, 4, 29, 16, 0),
    end: new Date(2025, 4, 29, 17, 0),
    description: '数学の二次関数',
    color: '#D4FFC1', // ライトグリーン
  },
  {
    id: 4,
    title: '資料作成締め切り',
    start: new Date(2025, 5, 1, 9, 0), // 6月1日
    end: new Date(2025, 5, 1, 17, 0),
    description: '来月の教材準備',
    color: '#FFC1C1', // ライトレッド
  },
];


const MainPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStartDate, setNewEventStartDate] = useState('');
  const [newEventStartTime, setNewEventStartTime] = useState('');
  const [newEventEndDate, setNewEventEndDate] = useState('');
  const [newEventEndTime, setNewEventEndTime] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventColor, setNewEventColor] = useState('#FFDDC1');

  // 2025年の祝日データ
  const holidays2025 = {
    "2025-01-01": "元日",
    "2025-01-13": "成人の日",
    "2025-02-11": "建国記念の日",
    "2025-02-23": "天皇誕生日",
    "2025-03-20": "春分の日",
    "2025-04-29": "昭和の日",
    "2025-05-03": "憲法記念日",
    "2025-05-04": "みどりの日",
    "2025-05-05": "こどもの日",
    "2025-07-21": "海の日",
    "2025-08-11": "山の日",
    "2025-09-15": "敬老の日",
    "2025-09-23": "秋分の日",
    "2025-10-13": "スポーツの日",
    "2025-11-03": "文化の日",
    "2025-11-23": "勤労感謝の日",
  };


  const handlePrevMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // 「日程を追加する」ボタンクリック
  const handleAddEventClick = () => {
    setSelectedEvent(null); // 新規追加なので選択中のイベントをクリア
    setNewEventTitle('');
    setNewEventStartDate('');
    setNewEventStartTime('');
    setNewEventEndDate('');
    setNewEventEndTime('');
    setNewEventDescription('');
    setNewEventColor('#FFDDC1');
    setIsEventModalOpen(true);
  };

  // イベントクリック時（詳細/編集用）
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setNewEventTitle(event.title);
    setNewEventStartDate(event.start.toISOString().split('T')[0]);
    setNewEventStartTime(event.start.toTimeString().substring(0, 5));
    if (event.end) {
        setNewEventEndDate(event.end.toISOString().split('T')[0]);
        setNewEventEndTime(event.end.toTimeString().substring(0, 5));
    } else {
        setNewEventEndDate('');
        setNewEventEndTime('');
    }
    setNewEventDescription(event.description || '');
    setNewEventColor(event.color || '#FFDDC1');
    setIsEventModalOpen(true);
  };

  // イベント追加/更新フォームの送信
  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEventTitle || !newEventStartDate || !newEventStartTime) {
      alert('タイトル、開始日、開始時間を入力してください。');
      return;
    }

    const startDateTime = new Date(`${newEventStartDate}T${newEventStartTime}`);
    let endDateTime: Date | undefined;
    if (newEventEndDate && newEventEndTime) {
      endDateTime = new Date(`${newEventEndDate}T${newEventEndTime}`);
      if (endDateTime < startDateTime) {
          alert('終了時間は開始時間より後に設定してください。');
          return;
      }
    } else {
        // 終了日時がない場合は、開始日時から1時間後をデフォルトとする
        endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
    }


    if (selectedEvent) {
      // イベント更新
      setEvents(events.map(ev =>
        ev.id === selectedEvent.id
          ? {
              ...ev,
              title: newEventTitle,
              start: startDateTime,
              end: endDateTime as Date, // endDateTimeは必ず存在するようにロジックで保証
              description: newEventDescription,
              color: newEventColor,
            }
          : ev
      ));
      alert('イベントを更新しました！');
    } else {
      // イベント追加
      const newId = events.length > 0 ? Math.max(...events.map(ev => ev.id)) + 1 : 1;
      const newEvent: CalendarEvent = {
        id: newId,
        title: newEventTitle,
        start: startDateTime,
        end: endDateTime as Date, // endDateTimeは必ず存在するようにロジックで保証
        description: newEventDescription,
        color: newEventColor,
      };
      setEvents([...events, newEvent]);
      alert('イベントを追加しました！');
    }

    setIsEventModalOpen(false); // モーダルを閉じる
  };

  // イベント削除
  const handleDeleteEvent = () => {
    if (selectedEvent && confirm('このイベントを削除してもよろしいですか？')) {
      setEvents(events.filter(ev => ev.id !== selectedEvent.id));
      setIsEventModalOpen(false);
      setSelectedEvent(null);
      alert('イベントを削除しました！');
    }
  };


  return (
    <div className="container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <main className="content-area">
          <div className="calendar-section">
            <div className="calendar-controls">
              <button onClick={handlePrevMonth}>&lt; 前の月</button>
              <h2>{currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月</h2>
              <button onClick={handleNextMonth}>次の月 &gt;</button>
            </div>
            <button className="add-event-btn" onClick={handleAddEventClick}>
              + 日程を追加する
            </button>
            <Calendar
              currentDate={currentDate}
              events={events.filter(event =>
                event.start.getFullYear() === currentDate.getFullYear() &&
                event.start.getMonth() === currentDate.getMonth()
              )}
              holidays={holidays2025} // 祝日データを渡す
              onEventClick={handleEventClick}
            />
          </div>

          {/* イベント追加/詳細モーダル */}
          {isEventModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>{selectedEvent ? 'イベントを編集' : '新しい日程を追加'}</h3>
                <form onSubmit={handleSubmitEvent}>
                  <div className="input-group">
                    <label htmlFor="event-title">タイトル:</label>
                    <input
                      type="text"
                      id="event-title"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="event-start-date">開始日時:</label>
                    <input
                      type="date"
                      id="event-start-date"
                      value={newEventStartDate}
                      onChange={(e) => setNewEventStartDate(e.target.value)}
                      required
                    />
                    <input
                      type="time"
                      id="event-start-time"
                      value={newEventStartTime}
                      onChange={(e) => setNewEventStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="event-end-date">終了日時 (任意):</label>
                    <input
                      type="date"
                      id="event-end-date"
                      value={newEventEndDate}
                      onChange={(e) => setNewEventEndDate(e.target.value)}
                    />
                    <input
                      type="time"
                      id="event-end-time"
                      value={newEventEndTime}
                      onChange={(e) => setNewEventEndTime(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="event-description">説明:</label>
                    <textarea
                      id="event-description"
                      rows={3}
                      value={newEventDescription}
                      onChange={(e) => setNewEventDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="input-group">
                    <label htmlFor="event-color">色:</label>
                    <input
                      type="color"
                      id="event-color"
                      value={newEventColor}
                      onChange={(e) => setNewEventColor(e.target.value)}
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="submit-btn">
                      {selectedEvent ? '更新する' : '追加する'}
                    </button>
                    {selectedEvent && (
                      <button type="button" className="delete-btn" onClick={handleDeleteEvent}>
                        削除する
                      </button>
                    )}
                    <button type="button" className="cancel-btn" onClick={() => setIsEventModalOpen(false)}>
                      キャンセル
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MainPage;
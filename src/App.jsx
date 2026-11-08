
import { useState, useEffect, useRef } from 'react';
import './App.css';

const moods = [
  { id: 1, name: 'Mutlu', emoji: '😊', color: '#f8c66d' },
  { id: 2, name: 'Huzurlu', emoji: '😌', color: '#9bc9b5' },
  { id: 3, name: 'Normal', emoji: '😐', color: '#a9b5d4' },
  { id: 4, name: 'Üzgün', emoji: '😔', color: '#9ba9d8' },
  { id: 5, name: 'Stresli', emoji: '😣', color: '#d9a0bd' }
];

const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function App() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  const noteInputRef = useRef(null);

  // Önceden kaydedilmiş günlükleri yükle
  const [entries, setEntries] = useState(() => {
    try {
      const savedEntries = localStorage.getItem('moodEntries');
      return savedEntries ? JSON.parse(savedEntries) : [];
    } catch (error) {
      console.error('Kayıtlar yüklenemedi:', error);
      return [];
    }
  });

  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString('tr-TR')
  );

  // Kayıtları tarayıcıda sakla
  useEffect(() => {
    localStorage.setItem('moodEntries', JSON.stringify(entries));
  }, [entries]);

  // Tarihi Türkçe biçime dönüştür
  const formatDate = (date) => date.toLocaleDateString('tr-TR');

  const today = new Date();
  const todayKey = formatDate(today);

  // Yeni günlük kaydet veya mevcut günlüğü güncelle
  const saveMood = () => {
    if (!selectedMood) {
      alert('Lütfen önce ruh halini seç!');
      return;
    }

    if (editingId !== null) {
      setEntries(prevEntries =>
        prevEntries.map(entry =>
          entry.id === editingId
            ? { ...entry, mood: selectedMood, note: note.trim() }
            : entry
        )
      );

      alert('Günlüğün başarıyla güncellendi! 🌸');
      setEditingId(null);
    } else {
      const newEntry = {
        id: Date.now(),
        mood: selectedMood,
        note: note.trim(),
        date: todayKey,
        timestamp: new Date().toISOString()
      };

      setEntries(prevEntries => [newEntry, ...prevEntries]);
      alert('Günlüğün başarıyla kaydedildi! 🌸');
    }

    setSelectedMood(null);
    setNote('');
  };

  // Günlüğü düzenleme alanına getir
  const editEntry = (entry) => {
    setEditingId(entry.id);
    setSelectedMood(entry.mood);
    setNote(entry.note || '');

    document.getElementById('journal')?.scrollIntoView({
      behavior: 'smooth'
    });

    setTimeout(() => noteInputRef.current?.focus(), 400);
  };

  // Düzenlemeyi iptal et
  const cancelEdit = () => {
    setEditingId(null);
    setSelectedMood(null);
    setNote('');
  };

  // Günlük kaydını sil
  const deleteEntry = (id) => {
    const confirmDelete = window.confirm(
      'Bu günlük kaydını silmek istediğine emin misin?'
    );

    if (confirmDelete) {
      setEntries(prevEntries =>
        prevEntries.filter(entry => entry.id !== id)
      );

      if (editingId === id) {
        cancelEdit();
      }
    }
  };

  // Günlük yazma alanına git ve imleci yerleştir
  const goToJournal = () => {
    document.getElementById('journal')?.scrollIntoView({
      behavior: 'smooth'
    });

    setTimeout(() => noteInputRef.current?.focus(), 400);
  };

  // Haftanın pazartesi gününü bul
  const startOfWeek = new Date(today);
  const dayNumber = (today.getDay() + 6) % 7;
  startOfWeek.setDate(today.getDate() - dayNumber);
  startOfWeek.setHours(0, 0, 0, 0);

  // Bu hafta oluşturulan kayıtlar
  const thisWeekEntries = entries.filter(entry => {
    if (!entry.timestamp) return false;
    const entryDate = new Date(entry.timestamp);
    return entryDate >= startOfWeek && entryDate <= today;
  });

  // Bugünün kayıtları
  const todayEntries = entries.filter(
    entry => entry.date === todayKey
  );

  // Ruh hali dağılımı
  const moodsCount = moods.map(mood => ({
    ...mood,
    count: entries.filter(
      entry => entry.mood.id === mood.id
    ).length
  }));

  // En çok seçilen ruh hali
  const mostCommonMood = [...moodsCount]
    .sort((a, b) => b.count - a.count)[0];

  const hasMoodRecords = entries.length > 0;

  // Son yedi günün grafik verileri
  const weeklyEntries = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);

    const dateKey = formatDate(date);

    return {
      dayName: date.toLocaleDateString('tr-TR', {
        weekday: 'short'
      }),
      dateKey,
      count: entries.filter(entry => entry.date === dateKey).length
    };
  });

  const maxCount = Math.max(
    ...weeklyEntries.map(day => day.count),
    1
  );

  // Takvim verileri
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDay = (firstDay.getDay() + 6) % 7;

  const calendarDays = [
    ...Array(startingDay).fill(null),
    ...Array.from(
      { length: lastDay.getDate() },
      (_, index) => index + 1
    )
  ];

  const selectedDayEntries = entries.filter(
    entry => entry.date === selectedDate
  );

  const previousMonth = () => {
    setCalendarDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCalendarDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="app-container">

      {/* Sol menü */}
      <aside className="sidebar">
        <div className="logo">
          <span>🌸</span>
          <h2>MoodBloom</h2>
        </div>

        <nav className="menu">
          <a href="#home">🏠 Ana Sayfa</a>
          <a
            href="#journal"
            onClick={event => {
              event.preventDefault();
              goToJournal();
            }}
          >
            📝 Günlüğüm
          </a>
          <a href="#statistics">📊 İstatistikler</a>
          <a href="#calendar">📅 Takvimim</a>
          <a href="#history">📖 Geçmişim</a>
        </nav>

        <div className="sidebar-bottom">
          <p>Kendine iyi bak.</p>
          <small>Her duygu değerlidir.</small>
        </div>
      </aside>

      {/* Ana içerik */}
      <main className="main-content">

        {/* Karşılama */}
        <header className="welcome-section" id="home">
          <div>
            <span className="date">
              {today.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>

            <h1>Merhaba! 🌸</h1>
            <p>Bugün kendine biraz zaman ayır.</p>
          </div>

          <div className="welcome-icon">🌷</div>
        </header>

        {/* İstatistik paneli */}
        <section className="statistics-section" id="statistics">
          <div className="section-heading">
            <span>📊</span>
            <h2>Genel İstatistiklerin</h2>
            <p>Ruh hâli günlüğünün genel görünümü.</p>
          </div>

          <div className="statistics-grid">
            <div className="statistics-card">
              <span className="statistics-icon">📔</span>
              <div>
                <p>Toplam Günlük</p>
                <strong>{entries.length}</strong>
              </div>
            </div>

            <div className="statistics-card">
              <span className="statistics-icon">☀️</span>
              <div>
                <p>Bugünkü Kayıt</p>
                <strong>{todayEntries.length}</strong>
              </div>
            </div>

            <div className="statistics-card">
              <span className="statistics-icon">📅</span>
              <div>
                <p>Bu Haftaki Kayıt</p>
                <strong>{thisWeekEntries.length}</strong>
              </div>
            </div>

            <div className="statistics-card">
              <span className="statistics-icon">
                {hasMoodRecords ? mostCommonMood.emoji : '🌱'}
              </span>
              <div>
                <p>En Sık Ruh Hali</p>
                <strong className="most-mood">
                  {hasMoodRecords ? mostCommonMood.name : 'Henüz yok'}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* Ruh hali seçimi */}
        <section className="mood-section">
          <div className="section-heading">
            <span>🌿</span>
            <h2>Bugün nasıl hissediyorsun?</h2>
            <p>
              Kendine biraz zaman ayır.
              Duygularını keşfet ve gününü güzelleştir.
            </p>
          </div>

          <div className="mood-grid">
            {moods.map(mood => (
              <button
                key={mood.id}
                className={`mood-card ${
                  selectedMood?.id === mood.id ? 'active' : ''
                }`}
                onClick={() => setSelectedMood(mood)}
                style={{ '--mood-color': mood.color }}
              >
                <span className="mood-emoji">{mood.emoji}</span>
                <span>{mood.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Günlük yazma alanı */}
        <section className="journal-section" id="journal">
          <div className="section-heading">
            <span>✍️</span>
            <h2>
              {editingId !== null
                ? 'Günlüğünü Düzenle'
                : 'Bugün neler yaşadın?'}
            </h2>
            <p>
              {editingId !== null
                ? 'Ruh halini veya notunu değiştirebilirsin.'
                : 'İstersen düşüncelerini buraya yazabilirsin.'}
            </p>
          </div>

          <textarea
            ref={noteInputRef}
            value={note}
            onChange={event => setNote(event.target.value)}
            placeholder="Bugün kendimi ... hissediyorum çünkü..."
            rows="5"
          />

          <div className="save-area">
            <span>Duygularını özgürce ifade et. 💜</span>

            <div className="form-buttons">
              {editingId !== null && (
                <button
                  className="cancel-button"
                  onClick={cancelEdit}
                >
                  İptal
                </button>
              )}

              <button onClick={saveMood}>
                {editingId !== null ? 'Güncelle ✓' : 'Kaydet →'}
              </button>
            </div>
          </div>
        </section>

        {/* Haftalık grafik */}
        <section className="weekly-section">
          <div className="section-heading">
            <span>📈</span>
            <h2>Haftalık Özet</h2>
            <p>Bu haftanın günlük kayıtları.</p>
          </div>

          <div className="weekly-chart">
            {weeklyEntries.map(day => (
              <div className="chart-column" key={day.dateKey}>
                <span className="chart-count">{day.count}</span>

                <div className="chart-bar-area">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${day.count > 0
                        ? (day.count / maxCount) * 100
                        : 0}%`
                    }}
                  />
                </div>

                <span className="chart-day">{day.dayName}</span>
              </div>
            ))}
          </div>

          <div className="total-entry">
            <strong>{thisWeekEntries.length}</strong>
            <span>Bu haftaki günlük kaydı</span>
          </div>
        </section>

        {/* Duygu dağılımı */}
        <section className="distribution-section">
          <div className="section-heading">
            <span>💜</span>
            <h2>Duygu Dağılımın</h2>
            <p>Şimdiye kadar kaydettiğin ruh halleri.</p>
          </div>

          <div className="mood-stats">
            {moodsCount.map(mood => {
              const percentage = entries.length > 0
                ? Math.round((mood.count / entries.length) * 100)
                : 0;

              return (
                <div className="stat-row" key={mood.id}>
                  <div className="stat-info">
                    <span>{mood.emoji} {mood.name}</span>
                    <strong>{percentage}%</strong>
                  </div>

                  <div className="stat-bar">
                    <div
                      className="stat-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: mood.color
                      }}
                    />
                  </div>

                  <small>{mood.count} kayıt</small>
                </div>
              );
            })}
          </div>
        </section>

        {/* Takvim */}
        <section className="calendar-section" id="calendar">
          <div className="section-heading">
            <span>📅</span>
            <h2>Duygu Takvimin</h2>
            <p>Günlük tuttuğun günleri buradan takip edebilirsin.</p>
          </div>

          <div className="calendar-header">
            <button onClick={previousMonth}>‹</button>

            <h3>
              {calendarDate.toLocaleDateString('tr-TR', {
                month: 'long',
                year: 'numeric'
              })}
            </h3>

            <button onClick={nextMonth}>›</button>
          </div>

          <div className="calendar-grid">
            {weekDays.map(day => (
              <div className="calendar-weekday" key={day}>
                {day}
              </div>
            ))}

            {calendarDays.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    className="calendar-empty"
                    key={`empty-${index}`}
                  />
                );
              }

              const currentDate = new Date(year, month, day);
              const dateKey = formatDate(currentDate);

              const dayEntries = entries.filter(
                entry => entry.date === dateKey
              );

              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDate;

              return (
                <button
                  key={dateKey}
                  className={`calendar-day
                    ${isToday ? 'today' : ''}
                    ${isSelected ? 'selected' : ''}
                    ${dayEntries.length > 0 ? 'has-entry' : ''}`}
                  onClick={() => setSelectedDate(dateKey)}
                >
                  <span>{day}</span>

                  {dayEntries.length > 0 && (
                    <span className="calendar-dot">
                      {dayEntries.length > 1
                        ? dayEntries.length
                        : dayEntries[0].mood.emoji}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="calendar-legend">
            <span className="legend-dot" />
            Günlük kaydı bulunan gün
          </div>

          <div className="selected-day">
            <h3>{selectedDate} kayıtları</h3>

            {selectedDayEntries.length === 0 ? (
              <p className="no-day-entry">
                Bu gün için henüz bir günlük kaydı bulunmuyor. 🌱
              </p>
            ) : (
              <div className="selected-day-list">
                {selectedDayEntries.map(entry => (
                  <div className="selected-day-card" key={entry.id}>
                    <span>{entry.mood.emoji}</span>
                    <div>
                      <strong>{entry.mood.name}</strong>
                      <p>{entry.note || 'Not eklenmemiş.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Günlük geçmişi */}
        <section className="history-section" id="history">
          <div className="section-heading">
            <span>📖</span>
            <h2>Son Günlüklerin</h2>
            <p>Geçmişte hissettiklerine tekrar göz at.</p>
          </div>

          {entries.length === 0 ? (
            <div className="empty-history">
              <span>🌱</span>
              <p>Henüz bir günlük kaydın yok.</p>
              <small>İlk kaydını oluşturarak başlayabilirsin.</small>
            </div>
          ) : (
            <div className="history-list">
              {entries.slice(0, 4).map(entry => (
                <div className="history-card" key={entry.id}>
                  <span className="history-emoji">
                    {entry.mood.emoji}
                  </span>

                  <div className="history-content">
                    <strong>{entry.mood.name}</strong>
                    <small>{entry.date}</small>
                    {entry.note && <p>{entry.note}</p>}
                  </div>

                  <div className="history-actions">
                    <button
                      className="edit-button"
                      onClick={() => editEntry(entry)}
                      title="Günlüğü düzenle"
                    >
                      ✏️
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => deleteEntry(entry.id)}
                      title="Günlüğü sil"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="footer">
          <p>
            MoodBloom © 2026 · Kendine iyi bak,
            her gün yeniden çiçek aç. 🌸
          </p>
        </footer>

      </main>
    </div>
  );
}

export default App;

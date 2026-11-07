import React, { useMemo, useState } from 'react';
import {
  LayoutDashboard, Users, MessageSquare, QrCode, BarChart3,
  Settings, Bell, Star, ChevronRight, Utensils, Plus, ArrowLeft,
  CheckCircle2
} from 'lucide-react';

const categories = [
  {
    key: 'food',
    label: 'Еда',
    reasons: [
      'Блюдо было холодным',
      'Невкусное блюдо',
      'Несвежие продукты',
      'Неприятный запах или вкус',
      'Не понравилась подача',
      'Маленькая порция',
      'Блюдо не соответствовало описанию',
      'Другое'
    ]
  },
  {
    key: 'service',
    label: 'Обслуживание',
    reasons: [
      'Долго принимали заказ',
      'Долго ждали заказ',
      'Официант был невнимателен',
      'Невежливое общение',
      'Ошибка в заказе',
      'Не помогли с выбором',
      'Другое'
    ]
  },
  {
    key: 'atmosphere',
    label: 'Атмосфера',
    reasons: [
      'Было слишком шумно',
      'В помещении было грязно',
      'Было слишком жарко или холодно',
      'Неудобная мебель',
      'Неприятный запах',
      'Не понравилась музыка или освещение',
      'Другое'
    ]
  }
];

function StarRating({ value, onChange, large = false }) {
  return (
    <div style={{ display: 'flex', gap: large ? 12 : 5, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          aria-label={`${n} из 5`}
          onClick={() => onChange(n)}
          style={{
            border: 0, background: 'transparent', cursor: 'pointer',
            padding: 0, fontSize: large ? 38 : 19,
            lineHeight: 1, color: n <= value ? '#E5A000' : '#D7D9E0'
          }}
        >★</button>
      ))}
    </div>
  );
}

function GuestReview({ waiterId }) {
  const [ratings, setRatings] = useState({ food: 0, service: 0, atmosphere: 0 });
  const [reasonSelections, setReasonSelections] = useState({});
  const [comments, setComments] = useState({});
  const [overallComment, setOverallComment] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [activeIssue, setActiveIssue] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const setRating = (key, value) => {
    setRatings(prev => ({ ...prev, [key]: value }));
    if (value <= 2) setActiveIssue(key);
    else setActiveIssue(current => current === key ? null : current);
  };

  const toggleReason = (key, reason) => {
    setReasonSelections(prev => {
      const current = prev[key] || [];
      return {
        ...prev,
        [key]: current.includes(reason)
          ? current.filter(item => item !== reason)
          : [...current, reason]
      };
    });
  };

  const canSubmit = Object.values(ratings).every(value => value > 0) &&
    categories.every(category =>
      ratings[category.key] > 2 || (reasonSelections[category.key] || []).length > 0
    );

  const submitReview = (event) => {
    event.preventDefault();
    const review = {
      waiterId,
      receiptNumber: receiptNumber.trim(),
      ratings,
      reasons: reasonSelections,
      issueComments: comments,
      comment: overallComment,
      createdAt: new Date().toISOString()
    };
    // Пока сохраняем отзыв в браузере для демонстрации.
    // Следующий этап — отправка этой структуры в Supabase.
    const existing = JSON.parse(localStorage.getItem('salat-demo-reviews') || '[]');
    localStorage.setItem('salat-demo-reviews', JSON.stringify([...existing, review]));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={guestStyles.page}>
        <div style={guestStyles.card}>
          <CheckCircle2 size={54} color="#16A34A" />
          <h1 style={{ marginBottom: 8 }}>Спасибо за ваш отзыв!</h1>
          <p style={guestStyles.muted}>Ваше мнение помогает нам становиться лучше.</p>
          <strong style={{ color: '#9333EA' }}>SALAT Restaurant</strong>
        </div>
      </div>
    );
  }

  return (
    <div style={guestStyles.page}>
      <form style={guestStyles.card} onSubmit={submitReview}>
        <div style={guestStyles.brand}>
          <div style={guestStyles.brandIcon}>S</div>
          <div><strong>SALAT</strong><div style={guestStyles.brandSub}>RESTAURANT · BĂLȚI</div></div>
        </div>
        <h1 style={{ margin: '24px 0 8px', fontSize: 25 }}>Оцените ваш визит</h1>
        <p style={guestStyles.muted}>Ваш отзыв поможет нам улучшить качество обслуживания.</p>
        <div style={guestStyles.waiter}>
          <Users size={18} color="#9333EA" />
          <span>Официант: <strong>{waiterId || 'Не указан'}</strong></span>
        </div>

        <label style={{ display: 'block', fontWeight: 600, margin: '18px 0 8px' }}>
          Номер чека <span style={{ color: '#9297a5', fontWeight: 400 }}>(необязательно)</span>
        </label>
        <input
          type="text"
          value={receiptNumber}
          onChange={e => setReceiptNumber(e.target.value)}
          placeholder="Например, 1258"
          maxLength={30}
          style={guestStyles.textInput}
        />

        {categories.map(category => (
          <section key={category.key} style={guestStyles.category}>
            <div style={guestStyles.categoryHeader}>
              <strong>{category.label}</strong>
              <span style={guestStyles.ratingHint}>
                {ratings[category.key] ? `${ratings[category.key]} из 5` : 'Поставьте оценку'}
              </span>
            </div>
            <StarRating
              large
              value={ratings[category.key]}
              onChange={value => setRating(category.key, value)}
            />
            {ratings[category.key] > 0 && ratings[category.key] <= 2 && (
              <div style={guestStyles.issueBox}>
                <strong style={{ display: 'block', marginBottom: 5 }}>
                  Что именно не понравилось?
                </strong>
                <p style={guestStyles.muted}>Выберите одну или несколько причин:</p>
                <div style={guestStyles.reasonGrid}>
                  {category.reasons.map(reason => (
                    <label key={reason} style={guestStyles.reason}>
                      <input
                        type="checkbox"
                        checked={(reasonSelections[category.key] || []).includes(reason)}
                        onChange={() => toggleReason(category.key, reason)}
                      />
                      {reason}
                    </label>
                  ))}
                </div>
                <textarea
                  value={comments[category.key] || ''}
                  onChange={e => setComments(prev => ({ ...prev, [category.key]: e.target.value }))}
                  placeholder="Дополнительный комментарий (необязательно)"
                  rows={2}
                  style={guestStyles.textarea}
                />
              </div>
            )}
          </section>
        ))}

        <label style={{ display: 'block', fontWeight: 600, margin: '20px 0 8px' }}>
          Общий комментарий (необязательно)
        </label>
        <textarea
          value={overallComment}
          onChange={e => setOverallComment(e.target.value)}
          placeholder="Расскажите подробнее о вашем посещении..."
          rows={4}
          style={guestStyles.textarea}
        />
        <button type="submit" disabled={!canSubmit} style={{
          ...guestStyles.submit,
          opacity: canSubmit ? 1 : .5,
          cursor: canSubmit ? 'pointer' : 'not-allowed'
        }}>
          Отправить отзыв
        </button>
        <p style={guestStyles.footnote}>Оценки по всем трём критериям обязательны.</p>
      </form>
    </div>
  );
}

export default function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const isReviewPage = params.has('review');
  const waiterId = params.get('review');
  const [active, setActive] = useState('Обзор');

  if (isReviewPage) return <GuestReview waiterId={waiterId} />;

  const navigation = [
    { name: 'Обзор', icon: LayoutDashboard },
    { name: 'Официанты', icon: Users },
    { name: 'Отзывы', icon: MessageSquare },
    { name: 'QR-коды', icon: QrCode },
    { name: 'Аналитика', icon: BarChart3 },
    { name: 'Настройки', icon: Settings }
  ];

  const stats = [
    { title: 'Всего отзывов', value: '248', change: '+18%', icon: MessageSquare },
    { title: 'Средний рейтинг', value: '4.8', change: '+0.3', icon: Star },
    { title: 'Сканирования QR', value: '1 284', change: '+24%', icon: QrCode },
    { title: 'Официанты', value: '18', change: 'Активны', icon: Users }
  ];

  const reviews = [
    { name: 'Александр', date: 'Сегодня, 14:32', rating: 5, text: 'Отличное обслуживание! Очень вкусная еда и приятная атмосфера.' },
    { name: 'Мария', date: 'Сегодня, 13:15', rating: 5, text: 'Спасибо официанту за прекрасное обслуживание!' },
    { name: 'Дмитрий', date: 'Сегодня, 12:40', rating: 4, text: 'Всё понравилось, немного долго ждали заказ.' },
    { name: 'Елена', date: 'Вчера, 19:20', rating: 3, text: 'Еда хорошая, но обслуживание можно улучшить.' }
  ];

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>S</div>
          <div><strong>SALAT</strong><div style={styles.logoSub}>MANAGER</div></div>
        </div>
        <div style={styles.menuTitle}>МЕНЮ</div>
        {navigation.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.name} onClick={() => setActive(item.name)}
              style={{ ...styles.navItem, ...(active === item.name ? styles.navActive : {}) }}>
              <Icon size={19} /><span>{item.name}</span>
              {active === item.name && <ChevronRight size={16} />}
            </div>
          );
        })}
        <div style={styles.sidebarBottom}>
          <div style={styles.restaurantCard}>
            <Utensils size={20} />
            <div><strong>SALAT Restaurant</strong><div style={styles.logoSub}>Bălți, Moldova</div></div>
          </div>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h2 style={styles.pageTitle}>{active}</h2>
            <div style={styles.muted}>Панель управления рестораном SALAT</div>
          </div>
          <div style={styles.headerRight}>
            <button style={styles.iconButton}><Bell size={19} /></button>
            <div style={styles.profile}>
              <div style={styles.avatar}>A</div>
              <div><strong>Администратор</strong><div style={styles.muted}>Управление</div></div>
            </div>
          </div>
        </header>

        {active === 'Обзор' && <>
          <section style={styles.welcome}>
            <div><h1>Добро пожаловать в SALAT Manager!</h1><p>Здесь собрана вся информация о работе ресторана.</p></div>
            <Utensils size={48} color="#ffffff" />
          </section>
          <div style={styles.sectionHeader}><h3>Основные показатели</h3><span style={styles.muted}>Демонстрационные данные</span></div>
          <div style={styles.statsGrid}>
            {stats.map(stat => {
              const Icon = stat.icon;
              return <div style={styles.statCard} key={stat.title}>
                <div style={styles.statTop}><div style={styles.statIcon}><Icon size={21} /></div><span style={styles.positive}>{stat.change}</span></div>
                <h2>{stat.value}</h2><p>{stat.title}</p>
              </div>;
            })}
          </div>
          <div style={styles.contentGrid}>
            <section style={styles.panel}>
              <div style={styles.panelHeader}><h3>Последние отзывы</h3><button style={styles.linkButton} onClick={() => setActive('Отзывы')}>Все отзывы →</button></div>
              {reviews.map((review, index) => <div style={styles.review} key={index}>
                <div style={styles.reviewAvatar}>{review.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={styles.reviewTop}><strong>{review.name}</strong><span style={styles.muted}>{review.date}</span></div>
                  <div style={styles.stars}>{'★'.repeat(review.rating)}<span style={{ color: '#d1d5db' }}>{'★'.repeat(5 - review.rating)}</span></div>
                  <p style={styles.reviewText}>{review.text}</p>
                </div>
              </div>)}
            </section>
            <section style={styles.panel}>
              <h3>Быстрые действия</h3>
              <button style={styles.action} onClick={() => setActive('QR-коды')}><QrCode size={21} /><span>Создать QR-код</span><ChevronRight size={17} /></button>
              <button style={styles.action} onClick={() => setActive('Официанты')}><Users size={21} /><span>Управление официантами</span><ChevronRight size={17} /></button>
              <button style={styles.action} onClick={() => setActive('Аналитика')}><BarChart3 size={21} /><span>Посмотреть аналитику</span><ChevronRight size={17} /></button>
              <div style={styles.ratingBox}><Star size={25} color="#eab308" /><div><h2>4.8 / 5.0</h2><p style={styles.muted}>Демонстрационный рейтинг</p></div></div>
            </section>
          </div>
        </>}

        {active !== 'Обзор' && <section style={styles.panel}>
          <h2>{active}</h2>
          <p style={styles.muted}>Раздел подготовлен для дальнейшего подключения базы данных.</p>
          {active === 'QR-коды' && <div style={{ marginTop: 16 }}>
            <p>После добавления официанта его персональная ссылка для отзывов будет иметь вид:</p>
            <code>{window.location.origin}/?review=ID_ОФИЦИАНТА</code>
          </div>}
          {active === 'Официанты' && <button style={styles.primaryButton}><Plus size={18} /> Добавить официанта</button>}
        </section>}

        <footer style={styles.footer}>SALAT Manager © 2026 · Система управления рестораном</footer>
      </main>
    </div>
  );
}

const guestStyles = {
  page: { minHeight: '100vh', background: '#f6f7fb', padding: '28px 14px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', fontFamily: 'Arial, sans-serif', color: '#202431' },
  card: { width: '100%', maxWidth: 560, background: '#fff', borderRadius: 18, padding: 26, boxShadow: '0 8px 35px rgba(20,20,40,.07)' },
  brand: { display: 'flex', alignItems: 'center', gap: 11 },
  brandIcon: { background: '#e9d5ff', color: '#9333ea', borderRadius: 11, padding: 11, fontSize: 21, fontWeight: 700 },
  brandSub: { fontSize: 10, color: '#9297a5', marginTop: 3, letterSpacing: 1 },
  muted: { color: '#9297a5', fontSize: 13, lineHeight: 1.5 },
  waiter: { display: 'flex', alignItems: 'center', gap: 9, background: '#f7f3ff', padding: 12, borderRadius: 10, margin: '18px 0' },
  category: { padding: '18px 0', borderBottom: '1px solid #eee' },
  categoryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ratingHint: { color: '#9297a5', fontSize: 12 },
  issueBox: { marginTop: 15, padding: 14, background: '#fff8f3', border: '1px solid #f5ddce', borderRadius: 11 },
  reasonGrid: { display: 'grid', gap: 10, margin: '12px 0' },
  reason: { display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13, lineHeight: 1.4 },
  textarea: { width: '100%', boxSizing: 'border-box', border: '1px solid #e2e4eb', borderRadius: 9, padding: 12, font: 'inherit', fontSize: 14, resize: 'vertical', marginTop: 8 },
  textInput: { width: '100%', boxSizing: 'border-box', border: '1px solid #e2e4eb', borderRadius: 9, padding: 12, font: 'inherit', fontSize: 14 },
  submit: { width: '100%', background: '#9333ea', color: '#fff', border: 0, borderRadius: 10, padding: 15, fontSize: 15, fontWeight: 700, marginTop: 20 },
  footnote: { color: '#9297a5', fontSize: 11, textAlign: 'center', marginTop: 10 }
};

const styles = {
  app: { display: 'flex', minHeight: '100vh', background: '#f6f7fb', color: '#202431', fontFamily: 'Arial, sans-serif' },
  sidebar: { width: 245, background: '#fff', borderRight: '1px solid #e9eaf0', padding: 24, display: 'flex', flexDirection: 'column', flexShrink: 0 },
  logo: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 55 },
  logoIcon: { background: '#e9d5ff', color: '#9333ea', borderRadius: 12, padding: 12, fontSize: 22, fontWeight: 'bold' },
  logoSub: { fontSize: 11, color: '#969baa', marginTop: 4 },
  menuTitle: { fontSize: 11, color: '#a0a4b0', marginBottom: 15, fontWeight: 'bold' },
  navItem: { display: 'flex', alignItems: 'center', gap: 13, padding: '13px 12px', borderRadius: 9, marginBottom: 7, cursor: 'pointer', color: '#707687', fontSize: 14 },
  navActive: { background: '#f3e8ff', color: '#9333ea', fontWeight: 'bold' },
  sidebarBottom: { marginTop: 'auto' },
  restaurantCard: { display: 'flex', alignItems: 'center', gap: 12, background: '#f7f7fa', padding: 13, borderRadius: 10 },
  main: { flex: 1, padding: '28px 35px', minWidth: 0 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  pageTitle: { margin: '0 0 7px', fontSize: 25 },
  muted: { color: '#9297a5', fontSize: 12 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 22 },
  iconButton: { background: '#fff', border: '1px solid #eee', padding: 11, borderRadius: 10, cursor: 'pointer' },
  profile: { display: 'flex', gap: 10, alignItems: 'center', fontSize: 13 },
  avatar: { width: 38, height: 38, borderRadius: '50%', background: '#e9d5ff', color: '#9333ea', display: 'grid', placeItems: 'center', fontWeight: 'bold' },
  welcome: { background: 'linear-gradient(110deg,#9333ea,#6d28d9)', borderRadius: 15, padding: 27, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16, marginBottom: 25 },
  statCard: { background: '#fff', padding: 20, borderRadius: 13, border: '1px solid #eee' },
  statTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statIcon: { background: '#f3e8ff', color: '#9333ea', padding: 10, borderRadius: 9 },
  positive: { color: '#16a34a', fontSize: 12 },
  contentGrid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 },
  panel: { background: '#fff', border: '1px solid #eee', borderRadius: 13, padding: 22, marginBottom: 20 },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  linkButton: { background: 'none', border: 0, color: '#9333ea', cursor: 'pointer' },
  review: { display: 'flex', gap: 12, padding: '17px 0', borderBottom: '1px solid #f0f0f3' },
  reviewAvatar: { width: 37, height: 37, borderRadius: '50%', background: '#f3e8ff', color: '#9333ea', display: 'grid', placeItems: 'center', fontWeight: 'bold', flexShrink: 0 },
  reviewTop: { display: 'flex', justifyContent: 'space-between', fontSize: 13, gap: 10 },
  stars: { color: '#eab308', marginTop: 6 },
  reviewText: { fontSize: 13, color: '#686e7c', lineHeight: 1.5 },
  action: { display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: 15, marginTop: 10, background: '#fafafa', border: '1px solid #eee', borderRadius: 9, cursor: 'pointer', color: '#444', textAlign: 'left' },
  ratingBox: { display: 'flex', gap: 15, alignItems: 'center', marginTop: 25, padding: 15, background: '#fffbeb', borderRadius: 10 },
  primaryButton: { display: 'flex', alignItems: 'center', gap: 8, background: '#9333ea', color: '#fff', border: 0, borderRadius: 8, padding: 12, cursor: 'pointer', marginTop: 20 },
  footer: { textAlign: 'center', color: '#a0a4b0', fontSize: 11, padding: 30 }
};

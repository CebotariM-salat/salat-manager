import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import {
  LayoutDashboard, Users, MessageSquare, QrCode, BarChart3,
  Settings, Bell, Star, ChevronRight, Utensils, Plus, ArrowLeft,
  CheckCircle2
} from 'lucide-react';

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    setLoading(false);

    if (error) {
      setError('Неверный email или пароль. Попробуйте ещё раз.');
      return;
    }

    onLogin();
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: '#f6f7fb', fontFamily: 'Arial, sans-serif'
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff', padding: 32, borderRadius: 16,
        width: '90%', maxWidth: 380, boxSizing: 'border-box'
      }}>
        <h2 style={{ textAlign: 'center' }}>SALAT Manager</h2>
        <p style={{ textAlign: 'center', color: '#9297a5' }}>
          Вход для администратора
        </p>

        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: 12, marginBottom: 12, boxSizing: 'border-box' }}
        />

        <input
          type="password"
          required
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: 12, marginBottom: 12, boxSizing: 'border-box' }}
        />

        {error && <p style={{ color: '#dc2626' }}>{error}</p>}

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: 13, background: '#9333ea',
          color: '#fff', border: 0, borderRadius: 8, cursor: 'pointer'
        }}>
          {loading ? 'Входим...' : 'Войти'}
        </button>
      </form>
    </div>
  );
};
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
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

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

  const canSubmit = receiptNumber.trim().length > 0 &&
    Object.values(ratings).every(value => value > 0) &&
    categories.every(category =>
      ratings[category.key] > 2 || (reasonSelections[category.key] || []).length > 0
    );

  const submitReview = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setSubmitError('');

    const { error } = await supabase
      .from('reviews')
      .insert({
        waiter_code: waiterId,
        receipt_number: receiptNumber.trim(),
        food_rating: ratings.food,
        service_rating: ratings.service,
        atmosphere_rating: ratings.atmosphere,
        overall_comment: overallComment.trim() || null,
        reason_selections: reasonSelections,
        issue_comments: comments
      });

    setSaving(false);

    if (error) {
      console.error('Supabase review insert failed:', error);
      setSubmitError('Не удалось отправить отзыв. Попробуйте ещё раз или обратитесь к сотруднику ресторана.');
      return;
    }

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
          Номер чека <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          type="text"
          required
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
        {submitError && (
          <p role="alert" style={{ color: '#dc2626', fontSize: 13, marginTop: 12 }}>
            {submitError}
          </p>
        )}
        <button type="submit" disabled={!canSubmit || saving} style={{
          ...guestStyles.submit,
          opacity: canSubmit && !saving ? 1 : .5,
          cursor: canSubmit && !saving ? 'pointer' : 'not-allowed'
        }}>
          {saving ? 'Отправляем...' : 'Отправить отзыв'}
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
  const [session, setSession] = useState(null);
const [authLoading, setAuthLoading] = useState(true);
  const [waiters, setWaiters] = useState([]);
  const [reviews, setReviews] = useState([]);
const [reviewsLoading, setReviewsLoading] = useState(false);
const [reviewsError, setReviewsError] = useState('');
  const [waitersLoading, setWaitersLoading] = useState(false);
  const [waiterModalOpen, setWaiterModalOpen] = useState(false);
  const [waiterName, setWaiterName] = useState('');
  const [waiterSaving, setWaiterSaving] = useState(false);
  const [waiterError, setWaiterError] = useState('');
  const [waiterSuccess, setWaiterSuccess] = useState('');

  useEffect(() => {
  if (isReviewPage) {
    setAuthLoading(false);
    return;
  }

  let mounted = true;

  supabase.auth.getSession().then(({ data: { session } }) => {
    if (mounted) {
      setSession(session);
      setAuthLoading(false);
    }
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session);
      setAuthLoading(false);
    }
  );

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, [isReviewPage]);
  const loadWaiters = async () => {
    setWaitersLoading(true);
    setWaiterError('');
    const { data, error } = await supabase
      .from('waiters')
      .select('id, name, code, active, created_at')
      .order('created_at', { ascending: false });
    setWaitersLoading(false);

    if (error) {
      console.error('Supabase waiters load failed:', error);
      setWaiterError('Не удалось загрузить официантов. Проверьте права доступа (RLS) к таблице waiters.');
      return;
    }
    setWaiters(data || []);
  };
const loadReviews = async () => {
  setReviewsLoading(true);
  setReviewsError('');

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  setReviewsLoading(false);

  if (error) {
    console.error('Supabase reviews load failed:', error);
    setReviewsError('Не удалось загрузить отзывы.');
    return;
  }

  setReviews(data || []);
};
  useEffect(() => {
    if (!isReviewPage && (active === 'Официанты' || active === 'QR-коды')) loadWaiters();
  }, [active, isReviewPage]);
useEffect(() => {
  if (!isReviewPage && active === 'Отзывы') {
    loadReviews();
  }
}, [active, isReviewPage]);
  const addWaiter = async (event) => {
    event.preventDefault();
    const cleanName = waiterName.trim();
    if (!cleanName || waiterSaving) return;

    const code = cleanName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\\u0300-\\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '')
      || `waiter${Date.now()}`;

    setWaiterSaving(true);
    setWaiterError('');
    setWaiterSuccess('');

    const { error } = await supabase
      .from('waiters')
      .insert({ name: cleanName, code, active: true });

    setWaiterSaving(false);

    if (error) {
      console.error('Supabase waiter insert failed:', error);
      setWaiterError(
        error.code === '23505'
          ? 'Такой код официанта уже существует. Добавьте к имени уточнение.'
          : 'Не удалось сохранить официанта. Возможно, для таблицы waiters ещё не настроены права INSERT в RLS.'
      );
      return;
    }

    setWaiterName('');
    setWaiterModalOpen(false);
    setWaiterSuccess('Официант успешно добавлен.');
    await loadWaiters();
  };

  if (isReviewPage) return <GuestReview waiterId={waiterId} />;
if (authLoading) {
  return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Загрузка...</div>;
}

if (!session) {
  return (
    <AdminLogin
      onLogin={() => {
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
      }}
    />
  );
}
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

  return (
    <div style={styles.app}>
      <style>{`@media print { body { background: #fff !important; } aside, header, footer, .no-print { display: none !important; } main { padding: 0 !important; } main > section { border: 0 !important; box-shadow: none !important; } ${''} }`}</style>
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
         <button
  onClick={() => supabase.auth.signOut()}
  style={{
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    color: '#64748b',
    padding: '10px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    marginLeft: '12px'
  }}
>
  Выйти
</button>
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
               <div style={styles.reviewAvatar}>
  {(review.receipt_number || '?').toString().slice(0, 1)}
</div>
<div style={{ flex: 1 }}>
  <div style={styles.reviewTop}>
    <strong>Чек №{review.receipt_number}</strong>
    <span style={styles.muted}>
      {new Date(review.created_at).toLocaleString('ru-RU')}
    </span>
  </div>
  <div style={styles.reviewText}>
    Еда: {review.food_rating}/5 ·
    Сервис: {review.service_rating}/5 ·
    Атмосфера: {review.atmosphere_rating}/5
  </div>
  <p style={styles.reviewText}>
    {review.overall_comment || 'Без общего комментария'}
  </p>
</div>
                </div>
              )}
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
          {active === 'Отзывы' && (
  <div style={{ marginTop: 18 }}>
    {reviewsLoading ? (
      <p style={styles.muted}>Загружаем отзывы...</p>
    ) : reviewsError ? (
      <p style={{ color: '#dc2626' }}>{reviewsError}</p>
    ) : reviews.length === 0 ? (
      <p style={styles.muted}>Пока отзывов нет.</p>
    ) : (
      <div style={{ display: 'grid', gap: 12 }}>
        {reviews.map((review, index) => (
          <article
            key={review.id || index}
            style={{
              padding: 16,
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              background: '#fff'
            }}
          >
            <strong>Чек №{review.receipt_number}</strong>
            <p style={styles.muted}>
              {new Date(review.created_at).toLocaleString('ru-RU')}
            </p>
            <p>Еда: {review.food_rating}/5</p>
            <p>Сервис: {review.service_rating}/5</p>
            <p>Атмосфера: {review.atmosphere_rating}/5</p>
            <p>{review.overall_comment || 'Без комментария'}</p>
            <p style={styles.muted}>
              Код официанта: {review.waiter_code}
            </p>
          </article>
        ))}
      </div>
    )}
  </div>
)}
          {active === 'QR-коды' && <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
              <p style={styles.muted}>У каждого официанта своя ссылка и персональный QR-код. Гость попадёт сразу на форму отзыва.</p>
              <button type="button" style={styles.primaryButton} onClick={() => window.print()} disabled={!waiters.length}>
                <QrCode size={18} /> Печать всех QR-кодов
              </button>
            </div>
            {waiterError && <p role="alert" style={{ color: '#dc2626', fontSize: 13 }}>{waiterError}</p>}
            {waitersLoading ? <p style={styles.muted}>Загружаем официантов...</p> :
              waiters.length === 0 ? <p style={styles.muted}>Сначала добавьте официантов в разделе «Официанты».</p> :
              <div style={qrStyles.grid}>
                {waiters.filter(waiter => waiter.active).map(waiter => {
                  const reviewUrl = `${window.location.origin}/?review=${encodeURIComponent(waiter.code)}`;
                  const downloadQr = () => {
                    const svg = document.getElementById(`waiter-qr-${waiter.id}`);
                    if (!svg) return;
                    const source = new XMLSerializer().serializeToString(svg);
                    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `SALAT-QR-${waiter.code}.svg`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    URL.revokeObjectURL(url);
                  };
                  return <article key={waiter.id} style={qrStyles.card}>
                    <strong style={{ fontSize: 16 }}>{waiter.name}</strong>
                    <div style={qrStyles.qrWrap}>
                      <QRCodeSVG id={`waiter-qr-${waiter.id}`} value={reviewUrl} size={176} level="H" includeMargin />
                    </div>
                    <span style={qrStyles.caption}>SALAT Restaurant · Оставьте отзыв</span>
                    <code style={qrStyles.url}>{reviewUrl}</code>
                    <div style={qrStyles.actions}>
                      <button type="button" style={qrStyles.button} onClick={downloadQr}>Скачать QR</button>
                      <button type="button" style={qrStyles.button} onClick={() => navigator.clipboard?.writeText(reviewUrl)}>Копировать ссылку</button>
                    </div>
                  </article>;
                })}
              </div>
            }
            <p style={{ ...styles.muted, marginTop: 18 }}>Для печати используйте кнопку «Печать всех QR-кодов». Неактивные официанты не отображаются.</p>
          </div>}
          {active === 'Официанты' && <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
              <p style={styles.muted}>Список сотрудников загружается из Supabase.</p>
              <button type="button" style={styles.primaryButton} onClick={() => { setWaiterError(''); setWaiterSuccess(''); setWaiterModalOpen(true); }}>
                <Plus size={18} /> Добавить официанта
              </button>
            </div>
            {waiterError && <p role="alert" style={{ color: '#dc2626', fontSize: 13 }}>{waiterError}</p>}
            {waiterSuccess && <p style={{ color: '#15803d', fontSize: 13 }}>{waiterSuccess}</p>}
            {waitersLoading ? <p style={styles.muted}>Загружаем список...</p> :
              waiters.length === 0 ? <p style={styles.muted}>Официантов пока нет или база не вернула записи.</p> :
              <div style={{ overflowX: 'auto', marginTop: 18 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                    <th style={{ padding: 10 }}>Имя</th><th style={{ padding: 10 }}>Код</th><th style={{ padding: 10 }}>Статус</th>
                  </tr></thead>
                  <tbody>{waiters.map(waiter => <tr key={waiter.id} style={{ borderBottom: '1px solid #f0f0f3' }}>
                    <td style={{ padding: 10 }}>{waiter.name}</td>
                    <td style={{ padding: 10 }}><code>{waiter.code}</code></td>
                    <td style={{ padding: 10 }}>{waiter.active ? 'Активен' : 'Неактивен'}</td>
                  </tr>)}</tbody>
                </table>
              </div>
            }
            {waiterModalOpen && <div role="presentation" onClick={() => !waiterSaving && setWaiterModalOpen(false)} style={{
              position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 15, 25, .45)',
              display: 'grid', placeItems: 'center', padding: 18
            }}>
              <form onSubmit={addWaiter} onClick={event => event.stopPropagation()} style={{
                width: '100%', maxWidth: 420, background: '#fff', borderRadius: 14, padding: 24,
                boxShadow: '0 15px 50px rgba(0,0,0,.18)'
              }}>
                <h3 style={{ marginTop: 0 }}>Новый официант</h3>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Имя и фамилия</label>
                <input autoFocus required maxLength={100} value={waiterName}
                  onChange={event => setWaiterName(event.target.value)}
                  placeholder="Например, Иван Петров"
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: 8, padding: 12, font: 'inherit' }} />
                {waiterError && <p role="alert" style={{ color: '#dc2626', fontSize: 12 }}>{waiterError}</p>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                  <button type="button" onClick={() => setWaiterModalOpen(false)} disabled={waiterSaving}
                    style={{ padding: '10px 14px', border: '1px solid #ddd', background: '#fff', borderRadius: 8, cursor: 'pointer' }}>Отмена</button>
                  <button type="submit" disabled={waiterSaving || !waiterName.trim()}
                    style={{ padding: '10px 14px', border: 0, background: '#9333ea', color: '#fff', borderRadius: 8, cursor: 'pointer', opacity: waiterSaving || !waiterName.trim() ? .6 : 1 }}>
                    {waiterSaving ? 'Сохраняем...' : 'Сохранить'}
                  </button>
                </div>
              </form>
            </div>}
          </>}
        </section>}

        <footer style={styles.footer}>SALAT Manager © 2026 · Система управления рестораном</footer>
      </main>
    </div>
  );
}

const qrStyles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16 },
  card: { background: '#fff', border: '1px solid #e9eaf0', borderRadius: 13, padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, breakInside: 'avoid' },
  qrWrap: { padding: 10, background: '#fff', border: '1px solid #eee', borderRadius: 10, lineHeight: 0 },
  caption: { fontSize: 11, color: '#737887', textAlign: 'center' },
  url: { fontSize: 10, color: '#737887', overflowWrap: 'anywhere', textAlign: 'center' },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 },
  button: { border: '1px solid #ddd', background: '#fff', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', fontSize: 12 }
};

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

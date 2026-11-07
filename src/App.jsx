
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  BarChart3,
  QrCode,
  Settings,
  Bell,
  Search,
  Star,
  TrendingUp,
  ThumbsUp,
  Clock,
  ChevronRight,
  Menu
} from 'lucide-react';

export default function App() {
  const [active, setActive] = useState('Обзор');

  const navigation = [
    { name: 'Обзор', icon: LayoutDashboard },
    { name: 'Официанты', icon: Users },
    { name: 'Отзывы', icon: MessageSquare },
    { name: 'QR-коды', icon: QrCode },
    { name: 'Аналитика', icon: BarChart3 },
    { name: 'Настройки', icon: Settings }
  ];

  const stats = [
    { title: 'Всего отзывов', value: '248', change: '+12.5%', icon: MessageSquare },
    { title: 'Средний рейтинг', value: '4.8', change: '+0.3', icon: Star },
    { title: 'Оценки 5 звезд', value: '186', change: '+18.2%', icon: ThumbsUp },
    { title: 'Официанты', value: '12', change: 'Активны', icon: Users }
  ];

  const reviews = [
    {
      name: 'Александр',
      waiter: 'Анна',
      rating: 5,
      text: 'Отличное обслуживание, всё очень понравилось!',
      time: '10 минут назад'
    },
    {
      name: 'Мария',
      waiter: 'Дмитрий',
      rating: 5,
      text: 'Очень приятный персонал и вкусная еда.',
      time: '35 минут назад'
    },
    {
      name: 'Иван',
      waiter: 'Елена',
      rating: 4,
      text: 'Всё хорошо, спасибо за обслуживание.',
      time: '1 час назад'
    },
    {
      name: 'Екатерина',
      waiter: 'Анна',
      rating: 5,
      text: 'Обязательно вернёмся ещё раз!',
      time: '2 часа назад'
    }
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">S</div>
          <div>
            <h2>SALAT</h2>
            <span>MANAGER</span>
          </div>
        </div>

        <div className="nav-label">ГЛАВНОЕ МЕНЮ</div>

        <nav>
          {navigation.map(item => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${active === item.name ? 'active' : ''}`}
                onClick={() => setActive(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
                {active === item.name && <ChevronRight size={16} />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="restaurant-status">
            <span className="status-dot"></span>
            Ресторан SALAT
            <small>Система активна</small>
          </div>

          <div className="profile">
            <div className="avatar">A</div>
            <div>
              <strong>Администратор</strong>
              <small>Главный аккаунт</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="mobile-brand">
            <Menu size={22} /> SALAT Manager
          </div>

          <div className="breadcrumb">
            Панель управления / <strong>{active}</strong>
          </div>

          <div className="top-actions">
            <button className="icon-button">
              <Search size={19} />
            </button>

            <button className="icon-button notification">
              <Bell size={19} />
              <i></i>
            </button>

            <div className="top-avatar">A</div>
          </div>
        </header>

        <div className="content">
          <div className="welcome">
            <div>
              <span className="eyebrow">
                РЕСТОРАН SALAT · BĂLȚI
              </span>

              <h1>
                {active === 'Обзор'
                  ? 'Добро пожаловать!'
                  : active}
              </h1>

              <p>
                Вот что происходит в вашем ресторане сегодня.
              </p>
            </div>

            <div className="date-label">
              <Clock size={16} />
              Панель администратора
            </div>
          </div>

          {active === 'Обзор' ? (
            <>
              <section className="stats-grid">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;

                  return (
                    <div className="stat-card" key={stat.title}>
                      <div className="stat-top">
                        <span>{stat.title}</span>

                        <div className={`stat-icon icon-${index}`}>
                          <Icon size={20} />
                        </div>
                      </div>

                      <div className="stat-bottom">
                        <strong>{stat.value}</strong>
                        <span>{stat.change}</span>
                      </div>
                    </div>
                  );
                })}
              </section>

              <section className="dashboard-grid">
                <div className="panel reviews-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Последние отзывы</h3>
                      <p>Недавняя активность гостей</p>
                    </div>

                    <button
                      onClick={() => setActive('Отзывы')}
                      className="view-all"
                    >
                      Все отзывы <ChevronRight size={15} />
                    </button>
                  </div>

                  {reviews.map((review, index) => (
                    <div className="review" key={index}>
                      <div className="review-avatar">
                        {review.name[0]}
                      </div>

                      <div className="review-info">
                        <strong>{review.name}</strong>
                        <span>Официант: {review.waiter}</span>
                        <p>{review.text}</p>
                      </div>

                      <div className="review-rating">
                        <span>
                          {'★'.repeat(review.rating)}
                        </span>
                        <small>{review.time}</small>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="right-column">
                  <div className="panel rating-panel">
                    <h3>Общий рейтинг</h3>
                    <p>Оценки ваших гостей</p>

                    <div className="rating-number">
                      4.8 <span>★</span>
                    </div>

                    <div className="rating-stars">
                      ★★★★★
                    </div>

                    <div className="rating-caption">
                      На основе 248 отзывов
                    </div>

                    <div className="rating-line">
                      <span style={{ width: '75%' }}></span>
                    </div>

                    <div className="rating-footer">
                      Отличная работа команды!
                    </div>
                  </div>

                  <div className="panel quick-panel">
                    <h3>Быстрые действия</h3>

                    <button onClick={() => setActive('Официанты')}>
                      <Users size={18} />
                      Управление официантами
                      <ChevronRight size={16} />
                    </button>

                    <button onClick={() => setActive('QR-коды')}>
                      <QrCode size={18} />
                      Создать QR-код
                      <ChevronRight size={16} />
                    </button>

                    <button onClick={() => setActive('Аналитика')}>
                      <TrendingUp size={18} />
                      Посмотреть аналитику
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <section className="panel empty-panel">
              <div className="empty-icon">
                {React.createElement(
                  navigation.find(item => item.name === active).icon,
                  { size: 32 }
                )}
              </div>

              <h2>{active}</h2>

              <p>
                Раздел подготовлен. Следующим этапом
                добавим его функциональность.
              </p>
            </section>
          )}

          <footer>
            © 2026 SALAT Manager · Restaurant Management System
          </footer>
        </div>
      </main>
    </div>
  );
}

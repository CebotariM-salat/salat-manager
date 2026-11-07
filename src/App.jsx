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

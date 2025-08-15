// Данные акций (теперь с реальными тикерами)
const stocks = [
    {
        id: 1,
        ticker: "SBER",
        name: "Сбербанк",
        fairPrice: 320.00
    },
    {
        id: 2,
        ticker: "GAZP",
        name: "Газпром",
        fairPrice: 170.00
    },
    {
        id: 3,
        ticker: "YNDX",
        name: "Яндекс",
        fairPrice: 4200.00
    },
    {
        id: 4,
        ticker: "LKOH",
        name: "Лукойл",
        fairPrice: 8000.00
    },
    {
        id: 5,
        ticker: "GMKN",
        name: "Норникель",
        fairPrice: 26000.00
    },
    {
        id: 6,
        ticker: "VTBR",
        name: "ВТБ",
        fairPrice: 0.042
    },
    {
        id: 7,
        ticker: "TATN",
        name: "Татнефть",
        fairPrice: 800.00
    },
    {
        id: 8,
        ticker: "ROSN",
        name: "Роснефть",
        fairPrice: 700.00
    }
];

// Глобальные переменные
let currentStock = null;
let currentTimeFrame = '1D';

// Глобальная обработка ошибок
window.addEventListener('error', function(event) {
    console.error("Global error:", event.error);
    document.body.innerHTML = `
        <div style="
            padding: 20px;
            background: #ffebee;
            color: #b71c1c;
            font-family: sans-serif;
        ">
            <h2>Произошла ошибка</h2>
            <p><strong>${event.error.message}</strong></p>
            <button onclick="location.reload()">Перезагрузить</button>
        </div>
    `;
});

try {
    // Инициализация Telegram Web App
    const tg = window.Telegram.WebApp;
    console.log("Telegram WebApp инициализирован");
    
    // Основные элементы DOM
    const splashScreen = document.getElementById('splash-screen');
    const appContent = document.getElementById('app-content');
    const mainScreen = document.getElementById('main-screen');
    const detailScreen = document.getElementById('detail-screen');
    const backButton = document.getElementById('back-button');
    const appTitle = document.getElementById('app-title');
    const searchInput = document.getElementById('search-input');
    const stocksList = document.getElementById('stocks-list');
    const stockName = document.getElementById('stock-name');
    const stockTickerEl = document.getElementById('stock-ticker');
    const currentPriceValue = document.getElementById('current-price-value');
    const priceChange = document.getElementById('price-change');
    const fairPriceEl = document.getElementById('fair-price');
    const growthPotentialEl = document.getElementById('growth-potential');
    
    // Функция для получения реальной цены с Мосбиржи
    async function fetchStockPrice(ticker) {
        try {
            const response = await fetch(`https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities/${ticker}.json?iss.meta=off&iss.only=securities,marketdata`);
            const data = await response.json();
            
            // Извлекаем последнюю цену
            const marketData = data.marketdata.data;
            if (marketData && marketData.length > 0) {
                // LAST - последняя цена сделки
                return marketData[0][12] || null;
            }
            
            return null;
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
            return null;
        }
    }
    
    // Функция для получения исторических данных (для вычисления изменения цены)
    async function fetchInitialPrice(ticker) {
        try {
            // Используем API Московской биржи для получения данных за прошлый месяц
            const response = await fetch(`https://iss.moex.com/iss/history/engines/stock/markets/shares/boards/TQBR/securities/${ticker}.json?from=2023-07-01&till=2023-07-31&iss.meta=off`);
            const data = await response.json();
            
            const history = data.history.data;
            if (history && history.length > 0) {
                // Берем цену закрытия первой доступной записи
                return history[0][11] || null;
            }
            
            return null;
        } catch (error) {
            console.error('Ошибка при получении исторических данных:', error);
            return null;
        }
    }
    
    // Простая функция для рендеринга акций
    async function renderStocks(filter = '') {
        console.log("Рендерим список акций");
        stocksList.innerHTML = '';
        
        const filteredStocks = filter ? 
            stocks.filter(stock => 
                stock.name.toLowerCase().includes(filter) || 
                stock.ticker.toLowerCase().includes(filter)
            ) : 
            stocks;
        
        for (const stock of filteredStocks) {
            // Получаем текущую цену
            const currentPrice = await fetchStockPrice(stock.ticker);
            if (currentPrice) stock.currentPrice = currentPrice;
            
            const stockItem = document.createElement('div');
            stockItem.className = 'stock-item';
            stockItem.innerHTML = `
                <div class="stock-info">
                    <div class="stock-name">${stock.name}</div>
                    <div class="stock-ticker">${stock.ticker}</div>
                </div>
                <div class="stock-price">${stock.currentPrice ? stock.currentPrice.toFixed(2) + ' RUB' : 'Загрузка...'}</div>
            `;
            
            stockItem.addEventListener('click', async () => {
                // Получаем начальную цену для расчета изменения
                if (!stock.initialPrice) {
                    stock.initialPrice = await fetchInitialPrice(stock.ticker);
                }
                showStockDetail(stock);
            });
            
            stocksList.appendChild(stockItem);
        }
    }
    
    // Показать детали акции
    function showStockDetail(stock) {
        console.log("Показываем детали для:", stock.name);
        
        currentStock = stock;
        mainScreen.classList.add('hidden');
        detailScreen.classList.remove('hidden');
        backButton.classList.remove('hidden');
        appTitle.textContent = stock.name;
        
        stockName.textContent = stock.name;
        stockTickerEl.textContent = stock.ticker;
        
        // Обновляем цену в реальном времени
        if (stock.currentPrice) {
            currentPriceValue.textContent = stock.currentPrice.toFixed(2) + ' RUB';
            
            // Рассчитываем изменение цены
            if (stock.initialPrice) {
                const priceChangeValue = stock.currentPrice - stock.initialPrice;
                const priceChangePercent = ((priceChangeValue / stock.initialPrice) * 100).toFixed(2);
                
                priceChange.textContent = `${priceChangeValue >= 0 ? '+' : ''}${priceChangeValue.toFixed(2)} (${priceChangePercent}%)`;
                priceChange.className = priceChangeValue >= 0 ? 'positive' : 'negative';
            }
        }
        
        // Справедливая цена и потенциал роста
        fairPriceEl.textContent = stock.fairPrice.toFixed(2) + ' RUB';
        
        if (stock.currentPrice) {
            const growth = ((stock.fairPrice - stock.currentPrice) / stock.currentPrice * 100).toFixed(2);
            growthPotentialEl.textContent = (growth > 0 ? '+' : '') + growth + '%';
            growthPotentialEl.className = growth >= 0 ? 'positive' : 'negative';
        }
        
        // Инициализация графика TradingView
        initTradingViewChart();
    }
    
    // Инициализация графика TradingView
    function initTradingViewChart() {
        const container = document.getElementById('tradingview-chart');
        container.innerHTML = ''; // Очищаем предыдущий график
        
        if (!currentStock) return;
        
        // Создаем виджет TradingView
        new TradingView.widget({
            "autosize": true,
            "symbol": `MOEX:${currentStock.ticker}`,
            "interval": currentTimeFrame === '1D' ? 'D' : 
                        currentTimeFrame === '1W' ? 'W' : 
                        currentTimeFrame === '1M' ? 'M' : '3M',
            "timezone": "Europe/Moscow",
            "theme": "light",
            "style": "1",
            "locale": "ru",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "hide_top_toolbar": true,
            "hide_legend": true,
            "save_image": false,
            "container_id": "tradingview-chart",
            "studies": ["RSI@tv-basicstudies"],
            "overrides": {
                "paneProperties.background": "#ffffff",
                "paneProperties.vertGridProperties.color": "#f0f0f0",
                "paneProperties.horzGridProperties.color": "#f0f0f0",
                "symbolWatermarkProperties.transparency": 90,
                "scalesProperties.textColor" : "#aaa",
                "mainSeriesProperties.candleStyle.upColor": '#4CAF50',
                "mainSeriesProperties.candleStyle.downColor": '#F44336',
                "mainSeriesProperties.candleStyle.borderUpColor": '#4CAF50',
                "mainSeriesProperties.candleStyle.borderDownColor": '#F44336',
                "mainSeriesProperties.candleStyle.wickUpColor": '#4CAF50',
                "mainSeriesProperties.candleStyle.wickDownColor": '#F44336'
            },
            "studies_overrides": {
                "rsi.display": "line",
                "rsi.linecolor": "#2575fc"
            }
        });
    }
    
    // Инициализация кнопок временных диапазонов
    function initTimeFrameButtons() {
        const buttons = document.querySelectorAll('.time-frame');
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                // Удаляем активный класс у всех кнопок
                buttons.forEach(btn => btn.classList.remove('active'));
                
                // Добавляем активный класс текущей кнопке
                this.classList.add('active');
                
                // Обновляем текущий временной диапазон
                currentTimeFrame = this.getAttribute('data-time');
                
                // Перезагружаем график
                if (currentStock) {
                    initTradingViewChart();
                }
            });
        });
    }
    
    // Обработчик для строки поиска
    searchInput.addEventListener('input', function() {
        renderStocks(this.value.toLowerCase());
    });
    
    // Обработчик для кнопки "Назад"
    backButton.addEventListener('click', function() {
        detailScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden');
        backButton.classList.add('hidden');
        appTitle.textContent = "Акции";
    });
    
    // Инициализация временных диапазонов
    initTimeFrameButtons();
    
    // Показываем splash screen 2 секунды, затем основное приложение
    setTimeout(() => {
        splashScreen.classList.add('hidden');
        appContent.classList.remove('hidden');
        if (tg && tg.expand) tg.expand();
        renderStocks();
    }, 2000);
    
    if (tg && tg.ready) tg.ready();
    console.log("Приложение успешно запущено");

} catch (e) {
    console.error("Ошибка инициализации:", e);
    document.body.innerHTML = `
        <div style="
            padding: 20px;
            background: #ffebee;
            color: #b71c1c;
            font-family: sans-serif;
        ">
            <h2>Ошибка при запуске</h2>
            <p><strong>${e.message}</strong></p>
            <button onclick="location.reload()">Перезагрузить</button>
        </div>
    `;
}
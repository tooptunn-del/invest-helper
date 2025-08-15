// Данные акций
const stocks = [
    {
        id: 1,
        ticker: "SBER",
        name: "Сбербанк",
        currentPrice: 300.50,
        fairPrice: 320.00,
        history: [290, 295, 305, 310, 300, 302, 300, 298, 300, 300.5]
    },
    {
        id: 2,
        ticker: "GAZP",
        name: "Газпром",
        currentPrice: 180.25,
        fairPrice: 170.00,
        history: [185, 182, 181, 179, 178, 177, 180, 181, 180.5, 180.25]
    },
    {
        id: 3,
        ticker: "YNDX",
        name: "Яндекс",
        currentPrice: 4000.00,
        fairPrice: 4200.00,
        history: [3900, 3950, 3980, 4000, 4010, 4005, 4000, 3990, 4000, 4000]
    },
    {
        id: 4,
        ticker: "LKOH",
        name: "Лукойл",
        currentPrice: 7500.50,
        fairPrice: 8000.00,
        history: [7400, 7450, 7500, 7550, 7600, 7520, 7480, 7490, 7510, 7500.5]
    },
    {
        id: 5,
        ticker: "GMKN",
        name: "Норникель",
        currentPrice: 25000.75,
        fairPrice: 26000.00,
        history: [24500, 24800, 25200, 25500, 25300, 25100, 24900, 25050, 25100, 25000.75]
    }
];

// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand(); // Раскрываем приложение сразу

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
const stockTicker = document.getElementById('stock-ticker');
const currentPriceValue = document.getElementById('current-price-value');
const priceChange = document.getElementById('price-change');
const fairPriceEl = document.getElementById('fair-price');
const growthPotentialEl = document.getElementById('growth-potential');
const tabButtons = document.querySelectorAll('.tab-button');
const refreshDataButton = document.getElementById('refresh-data');

// Кэш данных
const dataCache = {};
let currentPrices = {};

// Применяем тему Telegram
function applyTheme() {
    document.body.classList.toggle('dark-mode', tg.colorScheme === 'dark');
}

// Инициализация приложения
function initApp() {
    console.log("Инициализация приложения");
    
    splashScreen.classList.add('hidden');
    appContent.classList.remove('hidden');
    applyTheme();
    
    renderStocks();
    updateStockPrices();
    
    // Активируем обработчики
    setupEventListeners();
}

// Настройка всех обработчиков событий
function setupEventListeners() {
    console.log("Настройка обработчиков событий");
    
    // Обработчик для строки поиска
    searchInput.addEventListener('input', function() {
        renderStocks(this.value.toLowerCase());
    });

    // Обработчик для кнопки "Назад"
    backButton.addEventListener('click', function() {
        showMainScreen();
    });

    // Обработчики для вкладок
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            if (this.dataset.tab === 'articles') {
                tg.showAlert("Раздел статей в разработке!");
            }
        });
    });

    // Обработчик для кнопки обновления данных
    refreshDataButton.addEventListener('click', async function() {
        tg.showProgress();
        try {
            const currentTicker = stockTicker.textContent;
            delete dataCache[currentTicker];
            
            const newData = await fetchRealTimeData(currentTicker);
            initTradingViewChart(newData);
        } catch (error) {
            console.error("Ошибка обновления:", error);
        } finally {
            tg.hideProgress();
        }
    });
}

// Показ главного экрана
function showMainScreen() {
    console.log("Переход на главный экран");
    
    detailScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    backButton.classList.add('hidden');
    appTitle.textContent = "Акции";
}

// Показ экрана деталей акции
function showDetailScreen() {
    console.log("Переход на экран деталей");
    
    mainScreen.classList.add('hidden');
    detailScreen.classList.remove('hidden');
    backButton.classList.remove('hidden');
}

// Функция для отображения списка акций
function renderStocks(filter = '') {
    console.log("Рендерим список акций");
    
    stocksList.innerHTML = '';
    
    const filteredStocks = filter ? stocks.filter(stock => 
        stock.name.toLowerCase().includes(filter) || 
        stock.ticker.toLowerCase().includes(filter)
    ) : stocks;
    
    filteredStocks.forEach(stock => {
        const stockItem = document.createElement('div');
        stockItem.className = 'stock-item';
        stockItem.dataset.id = stock.id;
        
        const displayPrice = currentPrices[stock.ticker] || stock.currentPrice;
        
        stockItem.innerHTML = `
            <div class="stock-info">
                <div class="stock-name">${stock.name}</div>
                <div class="stock-ticker">${stock.ticker}</div>
            </div>
            <div class="stock-price">${displayPrice.toFixed(2)} RUB</div>
        `;
        
        stockItem.addEventListener('click', () => {
            console.log("Выбрана акция:", stock.name);
            loadStockDetail(stock);
        });
        
        stocksList.appendChild(stockItem);
    });
}

// Загрузка и отображение деталей акции
function loadStockDetail(stock) {
    console.log("Загрузка деталей для:", stock.name);
    
    // Показываем экран деталей
    showDetailScreen();
    
    // Обновляем заголовок
    appTitle.textContent = stock.name;
    
    // Заполняем данные
    stockName.textContent = stock.name;
    stockTicker.textContent = stock.ticker;
    
    const displayPrice = currentPrices[stock.ticker] || stock.currentPrice;
    currentPriceValue.textContent = displayPrice.toFixed(2) + ' RUB';
    
    // Рассчитываем изменение цены
    const priceChangeValue = displayPrice - stock.history[0];
    const priceChangePercent = ((priceChangeValue / stock.history[0]) * 100).toFixed(2);
    
    priceChange.textContent = `${priceChangeValue >= 0 ? '+' : ''}${priceChangeValue.toFixed(2)} (${priceChangePercent}%)`;
    priceChange.className = priceChangeValue >= 0 ? 'positive' : 'negative';
    
    // Справедливая цена и потенциал роста
    fairPriceEl.textContent = stock.fairPrice.toFixed(2) + ' RUB';
    
    const growth = ((stock.fairPrice - displayPrice) / displayPrice * 100).toFixed(2);
    growthPotentialEl.textContent = (growth > 0 ? '+' : '') + growth + '%';
    growthPotentialEl.className = growth >= 0 ? 'positive' : 'negative';
    
    // Загружаем график
    loadChartData(stock);
}

// Загрузка данных для графика
async function loadChartData(stock) {
    console.log("Загрузка данных для графика:", stock.ticker);
    
    const chartContainer = document.getElementById('tradingview-chart');
    chartContainer.innerHTML = '<div class="chart-loading">Загрузка графика...</div>';
    
    try {
        const realData = await fetchRealTimeData(stock.ticker);
        initTradingViewChart(realData.length > 0 ? realData : convertToCandles(stock.history));
    } catch (error) {
        console.error("Ошибка загрузки графика:", error);
        chartContainer.innerHTML = '<div class="chart-error">Ошибка загрузки графика</div>';
    }
}

// Функция для инициализации графика TradingView
function initTradingViewChart(data) {
    console.log("Инициализация графика TradingView");
    
    const chartContainer = document.getElementById('tradingview-chart');
    chartContainer.innerHTML = '';
    
    if (!data || data.length === 0) {
        chartContainer.innerHTML = '<div class="no-data">Нет данных для графика</div>';
        return;
    }
    
    try {
        const chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: 300,
            layout: {
                backgroundColor: tg.colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
                textColor: tg.colorScheme === 'dark' ? '#e0e0e0' : '#333',
            },
            grid: {
                vertLines: { visible: false },
                horzLines: { color: tg.colorScheme === 'dark' ? '#333' : '#eee' },
            }
        });
        
        const series = chart.addLineSeries({
            color: '#2575fc',
            lineWidth: 2,
        });
        
        series.setData(data.map((d, i) => ({ 
            time: i, 
            value: d.close 
        })));
        
    } catch (error) {
        console.error("Ошибка создания графика:", error);
        chartContainer.innerHTML = '<div class="chart-error">Ошибка создания графика</div>';
    }
}

// Функция для получения реальных данных
async function fetchRealTimeData(ticker) {
    console.log("Запрос данных для:", ticker);
    
    // Для простоты вернем тестовые данные
    return new Promise(resolve => {
        setTimeout(() => {
            const data = [];
            const basePrice = stocks.find(s => s.ticker === ticker)?.currentPrice || 100;
            
            for (let i = 0; i < 20; i++) {
                data.push({
                    time: i,
                    open: basePrice + i * 5 - 10,
                    high: basePrice + i * 5 + 5,
                    low: basePrice + i * 5 - 15,
                    close: basePrice + i * 5
                });
            }
            
            resolve(data);
        }, 300);
    });
}

// Конвертер для тестовых данных
function convertToCandles(prices) {
    return prices.map((price, i) => ({
        time: i,
        open: price - 10,
        high: price + 5,
        low: price - 15,
        close: price
    }));
}

// Функция для обновления цен акций
async function updateStockPrices() {
    console.log("Обновление цен акций");
    
    // Для теста - обновляем цены случайным образом
    stocks.forEach(stock => {
        const change = (Math.random() - 0.5) * stock.currentPrice * 0.1;
        currentPrices[stock.ticker] = stock.currentPrice + change;
    });
    
    renderStocks(searchInput.value.toLowerCase());
}

// Глобальный обработчик ошибок
window.addEventListener('error', function(event) {
    console.error("Global error:", event.error);
    tg.showAlert(`Произошла ошибка: ${event.message}`);
});

// Запуск приложения
setTimeout(initApp, 2000);
tg.ready();
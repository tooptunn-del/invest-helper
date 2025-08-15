// Данные акций
const stocks = [
    {
        id: 1,
        ticker: "SBER",
        name: "Сбербанк",
        currentPrice: 300.50,
        initialPrice: 290.00,
        fairPrice: 320.00
    },
    {
        id: 2,
        ticker: "GAZP",
        name: "Газпром",
        currentPrice: 180.25,
        initialPrice: 185.00,
        fairPrice: 170.00
    },
    {
        id: 3,
        ticker: "YNDX",
        name: "Яндекс",
        currentPrice: 4000.00,
        initialPrice: 3900.00,
        fairPrice: 4200.00
    },
    {
        id: 4,
        ticker: "LKOH",
        name: "Лукойл",
        currentPrice: 7500.50,
        initialPrice: 7400.00,
        fairPrice: 8000.00
    },
    {
        id: 5,
        ticker: "GMKN",
        name: "Норникель",
        currentPrice: 25000.75,
        initialPrice: 24500.00,
        fairPrice: 26000.00
    }
];

// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

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
const refreshDataButton = document.getElementById('refresh-data');

// Переменные для управления графиком
let currentChart = null;
let currentSeries = null;
let currentStock = null;
let currentTimeframe = "1M";

// Текущие цены
const currentPrices = {};

// Применяем тему Telegram
function applyTheme() {
    document.body.classList.toggle('dark-mode', tg.colorScheme === 'dark');
}

// Показываем splash screen 2 секунды, затем основное приложение
setTimeout(() => {
    splashScreen.classList.add('hidden');
    appContent.classList.remove('hidden');
    applyTheme();
    renderStocks();
    updateStockPrices();
}, 2000);

// Обработчики событий
searchInput.addEventListener('input', function() {
    renderStocks(this.value.toLowerCase());
});

backButton.addEventListener('click', function() {
    detailScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    backButton.classList.add('hidden');
    appTitle.textContent = "Акции";
});

refreshDataButton.addEventListener('click', async function() {
    tg.showProgress();
    await loadChartData(currentStock, currentTimeframe);
    tg.hideProgress();
});

// Функция для отображения списка акций
function renderStocks(filter = '') {
    stocksList.innerHTML = '';
    
    const filteredStocks = filter ? stocks.filter(stock => 
        stock.name.toLowerCase().includes(filter) || 
        stock.ticker.toLowerCase().includes(filter)
    ) : stocks;
    
    filteredStocks.forEach(stock => {
        const stockItem = document.createElement('div');
        stockItem.className = 'stock-item';
        stockItem.dataset.ticker = stock.ticker;
        
        const displayPrice = currentPrices[stock.ticker] || stock.currentPrice;
        
        stockItem.innerHTML = `
            <div class="stock-info">
                <div class="stock-name">${stock.name}</div>
                <div class="stock-ticker">${stock.ticker}</div>
            </div>
            <div class="stock-price">${displayPrice.toFixed(2)} RUB</div>
        `;
        
        stockItem.addEventListener('click', () => {
            loadStockDetail(stock);
        });
        
        stocksList.appendChild(stockItem);
    });
}

// Загрузка и отображение деталей акции
async function loadStockDetail(stock) {
    // Сохраняем текущую акцию
    currentStock = stock;
    
    // Показываем экран деталей
    detailScreen.classList.remove('hidden');
    mainScreen.classList.add('hidden');
    backButton.classList.remove('hidden');
    appTitle.textContent = stock.name;
    
    // Заполняем данные
    stockName.textContent = stock.name;
    stockTicker.textContent = stock.ticker;
    
    const displayPrice = currentPrices[stock.ticker] || stock.currentPrice;
    currentPriceValue.textContent = displayPrice.toFixed(2) + ' RUB';
    
    // Рассчитываем изменение цены
    const priceChangeValue = displayPrice - stock.initialPrice;
    const priceChangePercent = ((priceChangeValue / stock.initialPrice) * 100).toFixed(2);
    
    priceChange.textContent = `${priceChangeValue >= 0 ? '+' : ''}${priceChangeValue.toFixed(2)} (${priceChangePercent}%)`;
    priceChange.className = priceChangeValue >= 0 ? 'positive' : 'negative';
    
    // Справедливая цена и потенциал роста
    fairPriceEl.textContent = stock.fairPrice.toFixed(2) + ' RUB';
    
    const growth = ((stock.fairPrice - displayPrice) / displayPrice * 100).toFixed(2);
    growthPotentialEl.textContent = (growth > 0 ? '+' : '') + growth + '%';
    growthPotentialEl.className = growth >= 0 ? 'positive' : 'negative';
    
    // Загружаем график
    await loadChartData(stock, currentTimeframe);
    
    // Добавляем обработчики для кнопок временных диапазонов
    setupTimeframeButtons();
}

// Настройка обработчиков для кнопок временных диапазонов
function setupTimeframeButtons() {
    const buttons = document.querySelectorAll('.timeframe-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', async function() {
            // Убираем активность со всех кнопок
            buttons.forEach(b => b.classList.remove('active'));
            // Делаем активной текущую кнопку
            this.classList.add('active');
            
            const timeframe = this.dataset.timeframe;
            currentTimeframe = timeframe;
            
            tg.showProgress();
            await loadChartData(currentStock, timeframe);
            tg.hideProgress();
        });
    });
}

// Загрузка данных для графика
async function loadChartData(stock, timeframe = "1M") {
    const chartContainer = document.getElementById('tradingview-chart');
    
    // Показываем индикатор загрузки
    chartContainer.innerHTML = '<div class="chart-loading">Загрузка данных графика...</div>';
    
    try {
        // Получаем данные для графика
        const chartData = await fetchChartData(stock.ticker, timeframe);
        
        // Инициализируем график, если еще не создан
        if (!currentChart) {
            initTradingViewChart();
        }
        
        // Обновляем данные
        currentSeries.setData(chartData);
        
        // Настраиваем временную шкалу
        currentChart.timeScale().fitContent();
        
    } catch (error) {
        console.error("Ошибка загрузки графика:", error);
        chartContainer.innerHTML = '<div class="chart-error">Ошибка загрузки графика</div>';
    }
}

// Функция для инициализации графика
function initTradingViewChart() {
    const chartContainer = document.getElementById('tradingview-chart');
    chartContainer.innerHTML = '';
    
    currentChart = LightweightCharts.createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: 300,
        layout: {
            backgroundColor: tg.colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
            textColor: tg.colorScheme === 'dark' ? '#e0e0e0' : '#333',
        },
        grid: {
            vertLines: { visible: false },
            horzLines: { color: tg.colorScheme === 'dark' ? '#333' : '#eee' },
        },
        timeScale: {
            timeVisible: true,
            secondsVisible: false,
            fixLeftEdge: true,
            fixRightEdge: true,
        },
        localization: {
            locale: 'ru-RU',
            dateFormat: 'dd MMM yyyy',
        },
    });
    
    currentSeries = currentChart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
    });
}

// Функция для получения данных графика
async function fetchChartData(ticker, timeframe) {
    // Для простоты демо-версии сгенерируем реалистичные данные
    // В реальном приложении здесь будет запрос к API
    const basePrice = currentPrices[ticker] || stocks.find(s => s.ticker === ticker)?.currentPrice || 100;
    const data = [];
    const now = Date.now();
    
    // Определяем количество дней в зависимости от выбранного диапазона
    let days;
    switch (timeframe) {
        case "1D": days = 1; break;
        case "1W": days = 7; break;
        case "1M": days = 30; break;
        case "3M": days = 90; break;
        case "1Y": days = 365; break;
        case "ALL": days = 365 * 5; break;
        default: days = 30;
    }
    
    // Генерация реалистичных данных
    for (let i = days; i >= 0; i--) {
        const time = new Date(now - i * 86400000);
        const dateString = time.toISOString().split('T')[0];
        
        // Пропускаем выходные (суббота и воскресенье)
        if (time.getDay() === 0 || time.getDay() === 6) continue;
        
        // Генерация реалистичных цен
        const prevClose = i < days ? data[data.length - 1].close : basePrice;
        const volatility = basePrice * 0.02;
        
        const open = prevClose + (Math.random() - 0.5) * volatility;
        const close = open + (Math.random() - 0.5) * volatility;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;
        
        data.push({
            time: dateString,
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2))
        });
    }
    
    return data;
}

// Функция для обновления цен акций
async function updateStockPrices() {
    // Обновляем цены для всех акций
    for (const stock of stocks) {
        try {
            const response = await fetch(`https://iss.moex.com/iss/engines/stock/markets/shares/securities/${stock.ticker}.json?iss.meta=off&iss.only=securities&securities.columns=LAST`);
            const data = await response.json();
            
            if (data.securities.data.length > 0) {
                currentPrices[stock.ticker] = data.securities.data[0][0];
            }
        } catch (error) {
            console.error(`Ошибка обновления ${stock.ticker}:`, error);
            currentPrices[stock.ticker] = stock.currentPrice;
        }
    }
    
    // Обновляем список акций
    renderStocks();
    
    // Обновляем детали, если экран открыт
    if (!detailScreen.classList.contains('hidden') {
        const displayPrice = currentPrices[currentStock.ticker] || currentStock.currentPrice;
        currentPriceValue.textContent = displayPrice.toFixed(2) + ' RUB';
    }
    
    // Повторяем каждые 30 секунд
    setTimeout(updateStockPrices, 30000);
}

// Говорим Telegram, что приложение готово
tg.ready();

// Глобальный обработчик ошибок
window.addEventListener('error', function(event) {
    console.error("Global error:", event.error);
    tg.showAlert(`Произошла ошибка: ${event.message}`);
});
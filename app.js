// Данные акций
const stocks = [
    {
        id: 1,
        ticker: "SBER",
        name: "Сбербанк",
        currentPrice: 300.50,
        initialPrice: 290.00,
        fairPrice: 320.00,
        history: [290, 295, 305, 310, 300, 302, 300, 298, 300, 300.5]
    },
    {
        id: 2,
        ticker: "GAZP",
        name: "Газпром",
        currentPrice: 180.25,
        initialPrice: 160.00,
        fairPrice: 170.00,
        history: [185, 182, 181, 179, 178, 177, 180, 181, 180.5, 180.25]
    },
    {
        id: 3,
        ticker: "YDEX",
        name: "Яндекс",
        currentPrice: 4000.00,
        initialPrice: 3800.00,
        fairPrice: 4200.00,
        history: [3900, 3950, 3980, 4000, 4010, 4005, 4000, 3990, 4000, 4000]
    },
    {
        id: 4,
        ticker: "LKOH",
        name: "Лукойл",
        currentPrice: 7500.50,
        initialPrice: 6000.00,
        fairPrice: 8000.00,
        history: [7400, 7450, 7500, 7550, 7600, 7520, 7480, 7490, 7510, 7500.5]
    },
    {
        id: 5,
        ticker: "GMKN",
        name: "Норникель",
        currentPrice: 25000.75,
        initialPrice: 24000.00,
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
async function loadStockDetail(stock) {
    console.log("Загрузка деталей для:", stock.name);
    
    // Показываем экран деталей
    showDetailScreen();
    
    // Обновляем заголовок
    appTitle.textContent = stock.name;
    
    // Получаем актуальную цену
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
    tg.showProgress();
    try {
        const chartData = await fetchRealTimeData(stock.ticker);
        initTradingViewChart(chartData, stock);
    } catch (error) {
        console.error("Ошибка загрузки графика:", error);
        const chartContainer = document.getElementById('tradingview-chart');
        chartContainer.innerHTML = '<div class="chart-error">Ошибка загрузки графика</div>';
    } finally {
        tg.hideProgress();
    }
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

// Функция для инициализации графика TradingView с реальными данными
function initTradingViewChart(data, stock) {
    console.log("Инициализация графика TradingView с реальными данными");
    
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
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
        });
        
        // Создаем свечной график
        const series = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });
        
        // Конвертируем данные в нужный формат
        const chartData = data.map(item => ({
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close
        }));
        
        series.setData(chartData);
        
        // Настраиваем ось времени
        chart.timeScale().fitContent();
        
    } catch (error) {
        console.error("Ошибка создания графика:", error);
        chartContainer.innerHTML = '<div class="chart-error">Ошибка создания графика</div>';
    }
}

// Функция для получения реальных исторических данных
async function fetchRealTimeData(ticker) {
    console.log("Запрос исторических данных для:", ticker);
    
    try {
        // Используем MOEX ISS API для исторических данных
        const apiUrl = `https://iss.moex.com/iss/history/engines/stock/markets/shares/securities/${ticker}.json?from=2023-01-01&till=${new Date().toISOString().split('T')[0]}&iss.meta=off&limit=30`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (!data.history || !data.history.data) {
            throw new Error("Неверный формат данных");
        }
        
        // Форматируем данные для графика
        const candles = data.history.data.map(item => ({
            time: new Date(item[1]).getTime() / 1000, // Конвертация даты в timestamp
            open: item[2],
            high: item[3],
            low: item[4],
            close: item[5]
        }));
        
        console.log(`Получено ${candles.length} точек данных для ${ticker}`);
        return candles;
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        
        // Создаем демо-данные на основе текущей цены
        const basePrice = currentPrices[ticker] || stocks.find(s => s.ticker === ticker)?.currentPrice || 100;
        const demoData = [];
        
        for (let i = 0; i < 30; i++) {
            const variation = (Math.random() - 0.5) * basePrice * 0.1;
            demoData.push({
                time: Date.now() / 1000 - (30 - i) * 86400,
                open: basePrice + variation * 0.8,
                high: basePrice + variation * 1.2,
                low: basePrice + variation * 0.5,
                close: basePrice + variation
            });
        }
        
        return demoData;
    }
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

// Функция для обновления цен акций с MOEX API
async function updateStockPrices() {
    console.log("Обновление цен акций с MOEX API");
    
    for (const stock of stocks) {
        try {
            const ticker = stock.ticker;
            const apiUrl = `https://iss.moex.com/iss/engines/stock/markets/shares/securities/${ticker}.json?iss.meta=off&iss.only=securities&securities.columns=LAST`;
            
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data.securities.data.length > 0) {
                const lastPrice = data.securities.data[0][0];
                currentPrices[ticker] = lastPrice;
                
                console.log(`Обновлена цена для ${ticker}: ${lastPrice}`);
                
                // Обновляем DOM
                const priceElement = document.querySelector(`.stock-item[data-ticker="${ticker}"] .stock-price`);
                if (priceElement) {
                    priceElement.textContent = `${lastPrice.toFixed(2)} RUB`;
                    priceElement.classList.add('price-update-animation');
                    setTimeout(() => priceElement.classList.remove('price-update-animation'), 1000);
                }
            }
        } catch (error) {
            console.error(`Ошибка обновления ${stock.ticker}:`, error);
            // Используем статичную цену как запасной вариант
            currentPrices[stock.ticker] = stock.currentPrice;
        }
    }
    
    // Обновляем список каждые 30 секунд
    setTimeout(updateStockPrices, 30000);
}

// Глобальный обработчик ошибок
window.addEventListener('error', function(event) {
    console.error("Global error:", event.error);
    tg.showAlert(`Произошла ошибка: ${event.message}`);
});

// Запуск приложения
setTimeout(initApp, 2000);
tg.ready();
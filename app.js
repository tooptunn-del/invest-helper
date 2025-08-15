// Отладка кликов по акциям
document.getElementById('stocks-list').addEventListener('click', function(e) {
    console.log("Click detected in stocks list", e.target);
});

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
    if (tg.colorScheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Показываем splash screen 2 секунды, затем основное приложение
setTimeout(() => {
    splashScreen.classList.add('hidden');
    appContent.classList.remove('hidden');
    tg.expand();
    applyTheme();
    renderStocks();
    updateStockPrices(); // Первоначальное обновление цен
}, 2000);

// Обработчики событий
searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    renderStocks(searchTerm);
});

backButton.addEventListener('click', function() {
    detailScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    backButton.classList.add('hidden');
    appTitle.textContent = "Акции";
});

tabButtons.forEach(button => {
    button.addEventListener('click', function() {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        const tab = this.dataset.tab;
        if (tab === 'articles') {
            tg.showAlert("Раздел статей в разработке! Добавьте свои статьи позже.");
        }
    });
});

refreshDataButton.addEventListener('click', async function() {
    const currentTicker = stockTicker.textContent;
    delete dataCache[currentTicker];
    
    tg.showProgress();
    try {
        const newData = await fetchRealTimeData(currentTicker);
        initTradingViewChart(newData);
        
        // Обновляем цену в заголовке
        const newPrice = currentPrices[currentTicker] || stocks.find(s => s.ticker === currentTicker).currentPrice;
        currentPriceValue.textContent = newPrice.toFixed(2) + ' RUB';
        
    } catch (error) {
        console.error("Ошибка обновления:", error);
        tg.showAlert("Не удалось обновить данные");
    } finally {
        tg.hideProgress();
    }
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
        stockItem.setAttribute('data-ticker', stock.ticker);
        
        const displayPrice = currentPrices[stock.ticker] || stock.currentPrice;
        
        stockItem.innerHTML = `
            <div class="stock-info">
                <div class="stock-name">${stock.name}</div>
                <div class="stock-ticker">${stock.ticker}</div>
            </div>
            <div class="stock-price">${displayPrice.toFixed(2)} RUB</div>
        `;
        
        stockItem.addEventListener('click', async () => {
            tg.showProgress();
            try {
                await showStockDetail(stock);
            } catch (error) {
                console.error("Ошибка загрузки деталей:", error);
                tg.showAlert("Не удалось загрузить данные акции");
            } finally {
                tg.hideProgress();
            }
        });
        
        stocksList.appendChild(stockItem);
    });
}

// Функция для показа деталей акции
async function showStockDetail(stock) {
    console.log("Opening details for:", stock.name);
    
    // Сначала показываем экран деталей
    detailScreen.classList.remove('hidden');
    mainScreen.classList.add('hidden');
    backButton.classList.remove('hidden');
    appTitle.textContent = stock.name;
    
    // Затем заполняем данные
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
    
    // Показываем заглушку графика на время загрузки
    const chartContainer = document.getElementById('tradingview-chart');
    chartContainer.innerHTML = '<div class="chart-loading">Загрузка графика...</div>';
    
    // Загружаем данные для графика (без блокировки интерфейса)
    setTimeout(async () => {
        try {
            const realData = await fetchRealTimeData(stock.ticker);
            initTradingViewChart(realData.length > 0 ? realData : convertToCandles(stock.history));
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
            initTradingViewChart(convertToCandles(stock.history));
        }
    }, 0);
}

// Функция для инициализации графика TradingView
function initTradingViewChart(data) {
    const chartContainer = document.getElementById('tradingview-chart');
    
    // Очищаем контейнер
    chartContainer.innerHTML = '';
    
    // Проверяем данные
    if (!data || data.length === 0) {
        chartContainer.innerHTML = '<div class="no-data">Нет данных для графика</div>';
        return;
    }
    
    try {
        // Создаем график
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
        
        // Добавляем свечной ряд
        const series = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });
        
        // Устанавливаем данные
        series.setData(data);
        
        // Адаптация под изменение темы
        tg.onEvent('themeChanged', applyTheme);
        
    } catch (error) {
        console.error("Ошибка создания графика:", error);
        chartContainer.innerHTML = `
            <div class="chart-error">
                Ошибка загрузки графика: ${error.message}
                <button onclick="location.reload()">Обновить</button>
            </div>
        `;
    }
}

// Альтернативный источник данных (Yahoo Finance через RapidAPI)
async function fetchRealTimeData(ticker) {
    // Проверка кэша
    if (dataCache[ticker] && (Date.now() - dataCache[ticker].timestamp < 300000)) {
        return dataCache[ticker].data;
    }

    try {
        // Вариант 1: MOEX API (основной)
        const moexResponse = await fetch(`https://iss.moex.com/iss/engines/stock/markets/shares/securities/${ticker}.json?iss.meta=off&iss.only=securities&securities.columns=PREVPRICE`);
        const moexData = await moexResponse.json();
        
        if (moexData.securities.data.length > 0) {
            const price = moexData.securities.data[0][0];
            currentPrices[ticker] = price;
            
            // Формируем демо-график на основе цены
            const candles = [];
            const now = Date.now() / 1000;
            
            for (let i = 10; i > 0; i--) {
                const variation = (Math.random() - 0.5) * price * 0.05;
                candles.push({
                    time: now - i * 3600,
                    open: price + variation * 0.8,
                    high: price + variation * 1.2,
                    low: price + variation * 0.5,
                    close: price + variation
                });
            }
            
            // Сохраняем в кэш
            dataCache[ticker] = {
                data: candles,
                timestamp: Date.now()
            };
            
            return candles;
        }

        // Вариант 2: Альтернативный источник (если MOEX не ответил)
        const alternativeResponse = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}.ME?interval=1d&range=5d`);
        const altData = await alternativeResponse.json();
        
        const candles = altData.chart.result[0].indicators.quote[0].open.map((open, i) => ({
            time: altData.chart.result[0].timestamp[i],
            open: open,
            high: altData.chart.result[0].indicators.quote[0].high[i],
            low: altData.chart.result[0].indicators.quote[0].low[i],
            close: altData.chart.result[0].indicators.quote[0].close[i]
        }));
        
        // Сохраняем в кэш
        dataCache[ticker] = {
            data: candles,
            timestamp: Date.now()
        };
        
        return candles;
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        tg.showAlert("Ошибка загрузки данных. Используем демо-график");
        return [];
    }
}

// Конвертер для тестовых данных
function convertToCandles(prices) {
    return prices.map((price, i) => ({
        time: (Date.now() / 1000) - (prices.length - i) * 3600,
        open: price - 10,
        high: price + 5,
        low: price - 15,
        close: price
    }));
}

// Функция для обновления цен акций
async function updateStockPrices() {
    for (const stock of stocks) {
        try {
            // Прямой запрос к MOEX API (без CORS-прокси)
            const response = await fetch(`https://iss.moex.com/iss/engines/stock/markets/shares/securities/${stock.ticker}.json?iss.meta=off&iss.only=securities&securities.columns=PREVPRICE`);
            const data = await response.json();
            
            if (data.securities.data.length > 0) {
                const lastPrice = data.securities.data[0][0];
                currentPrices[stock.ticker] = lastPrice;
                
                const priceElement = document.querySelector(`.stock-item[data-ticker="${stock.ticker}"] .stock-price`);
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
}

// Глобальный обработчик ошибок
window.addEventListener('error', function(event) {
    console.error("Global error:", event.error);
    tg.showAlert(`Произошла ошибка: ${event.message}`);
});

// Говорим Telegram, что приложение готово
tg.ready();
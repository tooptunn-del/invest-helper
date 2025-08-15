// Данные акций (в реальном приложении вы будете обновлять этот список)
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
        ticker: "YDEX",
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
const fairPrice = document.getElementById('fair-price');
const growthPotential = document.getElementById('growth-potential');
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
    tg.expand(); // Раскрываем приложение на весь экран
    applyTheme(); // Применяем тему
    renderStocks();
}, 2000);

// Обработчик для строки поиска
searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    renderStocks(searchTerm);
});

// Обработчик для кнопки "Назад"
backButton.addEventListener('click', function() {
    detailScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    backButton.classList.add('hidden');
    appTitle.textContent = "Акции";
});

// Обработчики для вкладок
tabButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Убираем активность со всех кнопок
        tabButtons.forEach(btn => btn.classList.remove('active'));
        // Делаем активной текущую кнопку
        this.classList.add('active');
        
        const tab = this.dataset.tab;
        if (tab === 'articles') {
            alert("Раздел статей в разработке! Добавьте свои статьи позже.");
        }
    });
});

// Обработчик для кнопки обновления данных
refreshDataButton.addEventListener('click', async function() {
    const currentTicker = stockTicker.textContent;
    delete dataCache[currentTicker]; // Сбрасываем кэш
    
    tg.showProgress();
    try {
        const newData = await fetchRealTimeData(currentTicker);
        initTradingViewChart(newData);
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
    
    let filteredStocks = stocks;
    if (filter) {
        filteredStocks = stocks.filter(stock => 
            stock.name.toLowerCase().includes(filter) || 
            stock.ticker.toLowerCase().includes(filter)
        );
    }
    
    filteredStocks.forEach(stock => {
        const stockItem = document.createElement('div');
        stockItem.className = 'stock-item';
        stockItem.setAttribute('data-ticker', stock.ticker);
        
        // Используем реальную цену из кэша, если есть
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
    console.log("Отображаем акцию:", stock);
    mainScreen.classList.add('hidden');
    detailScreen.classList.remove('hidden');
    backButton.classList.remove('hidden');
    appTitle.textContent = stock.name;
    
    // Заполняем данные
    stockName.textContent = stock.name;
    stockTicker.textContent = stock.ticker;
    
    // Используем реальную цену из кэша, если есть
    const displayPrice = currentPrices[stock.ticker] || stock.currentPrice;
    currentPriceValue.textContent = displayPrice.toFixed(2) + ' RUB';
    
    // Рассчитываем изменение цены за последний период
    const priceChangeValue = displayPrice - stock.history[0];
    const priceChangePercent = ((priceChangeValue / stock.history[0]) * 100).toFixed(2);
    
    priceChange.textContent = `${priceChangeValue >= 0 ? '+' : ''}${priceChangeValue.toFixed(2)} (${priceChangePercent}%)`;
    priceChange.className = priceChangeValue >= 0 ? 'positive' : 'negative';
    
    // Справедливая цена и потенциал роста
    fairPrice.textContent = stock.fairPrice.toFixed(2) + ' RUB';
    
    const growth = ((stock.fairPrice - displayPrice) / displayPrice * 100).toFixed(2);
    growthPotential.textContent = (growth > 0 ? '+' : '') + growth + '%';
    growthPotential.className = growth >= 0 ? 'positive' : 'negative';
    
    // Загружаем данные для графика
    try {
        const realData = await fetchRealTimeData(stock.ticker);
        if (realData.length > 0) {
            initTradingViewChart(realData);
        } else {
            throw new Error("Нет данных для графика");
        }
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        initTradingViewChart(convertToCandles(stock.history));
        tg.showAlert("Используем демо-данные для графика");
    }
}

// Функция для инициализации графика TradingView
function initTradingViewChart(data) {
    const chartContainer = document.getElementById('tradingview-chart');
    
    // Очищаем предыдущий график
    while (chartContainer.firstChild) {
        chartContainer.removeChild(chartContainer.firstChild);
    }
    
    // Проверяем наличие данных
    if (!data || data.length === 0) {
        chartContainer.innerHTML = '<div class="no-data">Нет данных для графика</div>';
        return;
    }
    
    // Создаем график
    const chart = LightweightCharts.createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: 300,
        layout: {
            backgroundColor: tg.colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
            textColor: tg.colorScheme === 'dark' ? '#e0e0e0' : '#333',
        },
        grid: {
            vertLines: { color: tg.colorScheme === 'dark' ? '#333' : '#eee' },
            horzLines: { color: tg.colorScheme === 'dark' ? '#333' : '#eee' },
        },
        timeScale: {
            timeVisible: true,
            secondsVisible: false,
        },
    });
    
    const series = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
    });
    
    series.setData(data);
    
    // Адаптация под изменение темы
    tg.onEvent('themeChanged', () => {
        applyTheme();
        chart.applyOptions({
            layout: {
                backgroundColor: tg.colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
                textColor: tg.colorScheme === 'dark' ? '#e0e0e0' : '#333',
            },
            grid: {
                vertLines: { color: tg.colorScheme === 'dark' ? '#333' : '#eee' },
                horzLines: { color: tg.colorScheme === 'dark' ? '#333' : '#eee' },
            }
        });
    });
}

// Функция для получения реальных данных с MOEX
async function fetchRealTimeData(ticker) {
    // Проверка кэша
    if (dataCache[ticker] && (Date.now() - dataCache[ticker].timestamp < 300000)) {
        return dataCache[ticker].data;
    }

    try {
        // Альтернативный CORS-прокси
        const proxyUrl = "https://api.allorigins.win/raw?url=";
        const apiUrl = `https://iss.moex.com/iss/engines/stock/markets/shares/securities/${ticker}/candles.json?interval=60&limit=50`;
        
        const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Проверка наличия данных
        if (!data.candles || !data.candles.data || data.candles.data.length === 0) {
            throw new Error("Нет данных от биржи");
        }
        
        const candles = data.candles.data.map(candle => ({
            time: new Date(candle[6]).getTime() / 1000,
            open: candle[0],
            high: candle[1],
            low: candle[2],
            close: candle[3]
        }));

        // Сохраняем в кэш
        dataCache[ticker] = {
            data: candles,
            timestamp: Date.now()
        };
        
        return candles;
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        tg.showAlert("Ошибка загрузки графика. Используем демо-данные");
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
            const proxyUrl = "https://corsproxy.io/?";
            const apiUrl = `https://iss.moex.com/iss/engines/stock/markets/shares/securities/${stock.ticker}/candles.json?interval=1&limit=1`;
            
            const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
            const data = await response.json();
            
            if (data.candles.data.length > 0) {
                const lastPrice = data.candles.data[0][3]; // последняя цена закрытия
                currentPrices[stock.ticker] = lastPrice;
                
                // Обновляем DOM
                const priceElement = document.querySelector(`.stock-item[data-ticker="${stock.ticker}"] .stock-price`);
                if (priceElement) {
                    priceElement.textContent = `${lastPrice.toFixed(2)} RUB`;
                    priceElement.classList.add('price-update-animation');
                    setTimeout(() => priceElement.classList.remove('price-update-animation'), 1000);
                }
            }
        } catch (error) {
            console.error(`Ошибка обновления ${stock.ticker}:`, error);
        }
    }
}

// Запускаем обновление каждые 30 сек
setInterval(updateStockPrices, 30000);

// Первоначальное обновление цен
updateStockPrices();

// Глобальный обработчик ошибок
window.addEventListener('error', function(event) {
    console.error("Global error:", event.error);
    tg.showAlert(`Произошла ошибка: ${event.message}`);
});

// Говорим Telegram, что приложение готово
tg.ready();
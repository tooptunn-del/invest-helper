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
tg.expand(); // Раскрываем приложение на весь экран

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
    const currentTicker = stockTicker.textContent;
    await loadStockDetail(currentTicker);
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
    const chartContainer = document.getElementById('tradingview-chart');
    chartContainer.innerHTML = '<div class="chart-loading">Загрузка графика...</div>';
    
    setTimeout(() => {
        initTradingViewChart(stock);
    }, 300);
}

// Функция для инициализации графика
function initTradingViewChart(stock) {
    const chartContainer = document.getElementById('tradingview-chart');
    chartContainer.innerHTML = '';
    
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
            },
        });
        
        const series = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });
        
        // Генерация реалистичных тестовых данных
        const now = Date.now() / 1000;
        const basePrice = currentPrices[stock.ticker] || stock.currentPrice;
        const data = [];
        
        for (let i = 30; i > 0; i--) {
            const time = now - i * 86400; // Данные за последние 30 дней
            const variation = (Math.random() - 0.5) * basePrice * 0.1;
            const open = basePrice + variation;
            const close = open + (Math.random() - 0.5) * basePrice * 0.05;
            
            data.push({
                time: time,
                open: open,
                high: Math.max(open, close) + Math.random() * basePrice * 0.02,
                low: Math.min(open, close) - Math.random() * basePrice * 0.02,
                close: close
            });
        }
        
        series.setData(data);
        chart.timeScale().fitContent();
        
    } catch (error) {
        console.error("Ошибка создания графика:", error);
        chartContainer.innerHTML = '<div class="chart-error">Ошибка создания графика</div>';
    }
}

// Функция для обновления цен акций с использованием стабильного API
async function updateStockPrices() {
    // Для Сбербанка (SBER)
    try {
        const response = await fetch('https://iss.moex.com/iss/engines/stock/markets/shares/securities/SBER.json?iss.meta=off&iss.only=securities&securities.columns=LAST');
        const data = await response.json();
        if (data.securities.data.length > 0) {
            currentPrices.SBER = data.securities.data[0][0];
        }
    } catch (error) {
        console.error("Ошибка обновления SBER:", error);
        currentPrices.SBER = stocks.find(s => s.ticker === 'SBER').currentPrice;
    }

    // Для Газпрома (GAZP)
    try {
        const response = await fetch('https://iss.moex.com/iss/engines/stock/markets/shares/securities/GAZP.json?iss.meta=off&iss.only=securities&securities.columns=LAST');
        const data = await response.json();
        if (data.securities.data.length > 0) {
            currentPrices.GAZP = data.securities.data[0][0];
        }
    } catch (error) {
        console.error("Ошибка обновления GAZP:", error);
        currentPrices.GAZP = stocks.find(s => s.ticker === 'GAZP').currentPrice;
    }
    
    // Для Яндекса (YNDX)
    try {
        const response = await fetch('https://iss.moex.com/iss/engines/stock/markets/shares/securities/YNDX.json?iss.meta=off&iss.only=securities&securities.columns=LAST');
        const data = await response.json();
        if (data.securities.data.length > 0) {
            currentPrices.YNDX = data.securities.data[0][0];
        }
    } catch (error) {
        console.error("Ошибка обновления YNDX:", error);
        currentPrices.YNDX = stocks.find(s => s.ticker === 'YNDX').currentPrice;
    }
    
    // Для Лукойла (LKOH)
    try {
        const response = await fetch('https://iss.moex.com/iss/engines/stock/markets/shares/securities/LKOH.json?iss.meta=off&iss.only=securities&securities.columns=LAST');
        const data = await response.json();
        if (data.securities.data.length > 0) {
            currentPrices.LKOH = data.securities.data[0][0];
        }
    } catch (error) {
        console.error("Ошибка обновления LKOH:", error);
        currentPrices.LKOH = stocks.find(s => s.ticker === 'LKOH').currentPrice;
    }
    
    // Для Норникеля (GMKN)
    try {
        const response = await fetch('https://iss.moex.com/iss/engines/stock/markets/shares/securities/GMKN.json?iss.meta=off&iss.only=securities&securities.columns=LAST');
        const data = await response.json();
        if (data.securities.data.length > 0) {
            currentPrices.GMKN = data.securities.data[0][0];
        }
    } catch (error) {
        console.error("Ошибка обновления GMKN:", error);
        currentPrices.GMKN = stocks.find(s => s.ticker === 'GMKN').currentPrice;
    }
    
    // Обновляем список акций
    renderStocks(searchInput.value.toLowerCase());
    
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
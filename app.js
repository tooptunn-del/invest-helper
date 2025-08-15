// Данные акций (с вашими справедливыми ценами)
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
    const fairPriceEl = document.getElementById('fair-price');
    const growthPotentialEl = document.getElementById('growth-potential');
    const dailyChangeEl = document.getElementById('daily-change');
    const tradeVolumeEl = document.getElementById('trade-volume');
    const marketCapEl = document.getElementById('market-cap');
    
    // Функция для получения реальной цены с Мосбиржи
    async function fetchStockData(ticker) {
        try {
            const response = await fetch(`https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities/${ticker}.json?iss.meta=off&iss.only=securities,marketdata`);
            const data = await response.json();
            
            // Извлекаем данные
            const securityData = data.securities.data[0];
            const marketData = data.marketdata.data[0];
            
            if (securityData && marketData) {
                return {
                    currentPrice: marketData[12], // LAST - последняя цена сделки
                    openPrice: marketData[1],     // OPEN
                    lowPrice: marketData[3],      // LOW
                    highPrice: marketData[2],     // HIGH
                    tradeVolume: marketData[23],  // VOLTODAY - объем в рублях
                    marketCap: securityData[3],   // ISSUECAPITALIZATION - капитализация
                    change: marketData[5]         // CHANGE - изменение цены в %
                };
            }
            
            return null;
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
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
            // Создаем элемент акции
            const stockItem = document.createElement('div');
            stockItem.className = 'stock-item';
            stockItem.innerHTML = `
                <div class="stock-info">
                    <div class="stock-name">${stock.name}</div>
                    <div class="stock-ticker">${stock.ticker}</div>
                </div>
                <div class="stock-price" id="price-${stock.ticker}">
                    <span class="loader"></span>
                </div>
            `;
            
            stockItem.addEventListener('click', async () => {
                showStockDetail(stock);
            });
            
            stocksList.appendChild(stockItem);
            
            // Асинхронно загружаем данные о цене
            try {
                const stockData = await fetchStockData(stock.ticker);
                if (stockData && stockData.currentPrice) {
                    const priceElement = document.getElementById(`price-${stock.ticker}`);
                    priceElement.innerHTML = `${stockData.currentPrice.toFixed(2)} RUB`;
                    
                    // Сохраняем данные для быстрого доступа
                    stock.currentData = stockData;
                } else {
                    document.getElementById(`price-${stock.ticker}`).textContent = "Ошибка";
                }
            } catch (e) {
                document.getElementById(`price-${stock.ticker}`).textContent = "Ошибка";
                console.error(`Ошибка загрузки данных для ${stock.ticker}:`, e);
            }
        }
    }
    
    // Показать детали акции
    async function showStockDetail(stock) {
        console.log("Показываем детали для:", stock.name);
        
        // Показываем индикатор загрузки
        stockName.textContent = stock.name;
        stockTickerEl.textContent = stock.ticker;
        currentPriceValue.innerHTML = '<span class="loader"></span>';
        fairPriceEl.innerHTML = '<span class="loader"></span>';
        growthPotentialEl.innerHTML = '<span class="loader"></span>';
        dailyChangeEl.innerHTML = '<span class="loader"></span>';
        tradeVolumeEl.innerHTML = '<span class="loader"></span>';
        marketCapEl.innerHTML = '<span class="loader"></span>';
        
        // Переключаем экраны
        mainScreen.classList.add('hidden');
        detailScreen.classList.remove('hidden');
        backButton.classList.remove('hidden');
        appTitle.textContent = stock.name;
        
        // Загружаем данные, если их нет
        if (!stock.currentData) {
            stock.currentData = await fetchStockData(stock.ticker);
        }
        
        // Обновляем данные
        if (stock.currentData) {
            updateStockDetail(stock);
        } else {
            // Обработка ошибки
            currentPriceValue.textContent = "Ошибка";
            fairPriceEl.textContent = stock.fairPrice.toFixed(2) + ' RUB';
            growthPotentialEl.textContent = "Н/Д";
        }
    }
    
    // Обновление детальной информации об акции
    function updateStockDetail(stock) {
        const data = stock.currentData;
        
        // Текущая цена
        currentPriceValue.textContent = data.currentPrice.toFixed(2) + ' RUB';
        
        // Справедливая цена
        fairPriceEl.textContent = stock.fairPrice.toFixed(2) + ' RUB';
        
        // Потенциал роста
        const growth = ((stock.fairPrice - data.currentPrice) / data.currentPrice * 100).toFixed(2);
        const growthText = (growth > 0 ? '+' : '') + growth + '%';
        growthPotentialEl.textContent = growthText;
        growthPotentialEl.className = growth >= 0 ? 'positive' : 'negative';
        
        // Дополнительная информация
        dailyChangeEl.textContent = data.change > 0 ? '+' + data.change.toFixed(2) + '%' : data.change.toFixed(2) + '%';
        dailyChangeEl.className = data.change >= 0 ? 'positive' : 'negative';
        
        // Форматирование объема торгов
        const volume = data.tradeVolume;
        let volumeText;
        if (volume >= 1000000000) {
            volumeText = (volume / 1000000000).toFixed(1) + ' млрд RUB';
        } else if (volume >= 1000000) {
            volumeText = (volume / 1000000).toFixed(1) + ' млн RUB';
        } else {
            volumeText = volume.toFixed(0) + ' RUB';
        }
        tradeVolumeEl.textContent = volumeText;
        
        // Форматирование капитализации
        const marketCap = data.marketCap;
        let capText;
        if (marketCap >= 1000000000) {
            capText = (marketCap / 1000000000).toFixed(1) + ' млрд RUB';
        } else if (marketCap >= 1000000) {
            capText = (marketCap / 1000000).toFixed(1) + ' млн RUB';
        } else {
            capText = marketCap.toFixed(0) + ' RUB';
        }
        marketCapEl.textContent = capText;
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
    
    // Обработчик для вкладки "Статьи"
    document.querySelector('[data-tab="articles"]').addEventListener('click', function() {
        alert("Раздел статей в разработке. Скоро здесь появятся полезные материалы!");
    });
    
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
// Данные акций (с вашими справедливыми ценами)
const stocks = [
    {
        id: 1,
        ticker: "SBER",
        name: "Сбербанк",
        fairPrice: 345.00
    },
    {
        id: 2,
        ticker: "GAZP",
        name: "Газпром",
        fairPrice: 180.00
    },
    {
        id: 3,
        ticker: "YDEX",
        name: "Яндекс",
        fairPrice: 6800.00
    },
    {
        id: 4,
        ticker: "LKOH",
        name: "Лукойл",
        fairPrice: 8500.00
    },
    {
        id: 5,
        ticker: "GMKN",
        name: "Норникель",
        fairPrice: 150.00
    },
    {
        id: 6,
        ticker: "VTBR",
        name: "ВТБ",
        fairPrice: 130.00
    },
    {
        id: 7,
        ticker: "TATN",
        name: "Татнефть",
        fairPrice: 680.00
    },
    {
        id: 8,
        ticker: "ROSN",
        name: "Роснефть",
        fairPrice: 560.00
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
    
    // Функция для получения реальной цены с Мосбиржи
    async function fetchStockPrice(ticker) {
        try {
            const response = await fetch(`https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities/${ticker}.json?iss.meta=off&iss.only=marketdata`);
            const data = await response.json();
            
            // Извлекаем последнюю цену
            const marketData = data.marketdata.data;
            if (marketData && marketData.length > 0) {
                return marketData[0][12]; // LAST - последняя цена сделки
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
            
            stockItem.addEventListener('click', () => {
                showStockDetail(stock);
            });
            
            stocksList.appendChild(stockItem);
            
            // Асинхронно загружаем данные о цене
            try {
                const currentPrice = await fetchStockPrice(stock.ticker);
                if (currentPrice) {
                    document.getElementById(`price-${stock.ticker}`).innerHTML = `${currentPrice.toFixed(2)} RUB`;
                    stock.currentPrice = currentPrice; // Сохраняем цену
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
    function showStockDetail(stock) {
        console.log("Показываем детали для:", stock.name);
        
        // Показываем индикатор загрузки если цена еще не загружена
        stockName.textContent = stock.name;
        stockTickerEl.textContent = stock.ticker;
        
        if (!stock.currentPrice) {
            currentPriceValue.innerHTML = '<span class="loader"></span>';
        } else {
            currentPriceValue.textContent = `${stock.currentPrice.toFixed(2)} RUB`;
        }
        
        fairPriceEl.textContent = stock.fairPrice.toFixed(2) + ' RUB';
        growthPotentialEl.innerHTML = '<span class="loader"></span>';
        
        // Переключаем экраны
        mainScreen.classList.add('hidden');
        detailScreen.classList.remove('hidden');
        backButton.classList.remove('hidden');
        appTitle.textContent = stock.name;
        
        // Если цена уже загружена, сразу показываем потенциал роста
        if (stock.currentPrice) {
            updateGrowthPotential(stock);
        } else {
            // Если цена не загружена, загружаем ее
            fetchStockPrice(stock.ticker)
                .then(price => {
                    if (price) {
                        stock.currentPrice = price;
                        currentPriceValue.textContent = `${price.toFixed(2)} RUB`;
                        updateGrowthPotential(stock);
                    } else {
                        currentPriceValue.textContent = "Ошибка";
                        growthPotentialEl.textContent = "Ошибка";
                    }
                })
                .catch(() => {
                    currentPriceValue.textContent = "Ошибка";
                    growthPotentialEl.textContent = "Ошибка";
                });
        }
    }
    
    // Обновление потенциала роста
    function updateGrowthPotential(stock) {
        if (!stock.currentPrice) return;
        
        const growth = ((stock.fairPrice - stock.currentPrice) / stock.currentPrice * 100).toFixed(2);
        const growthText = (growth > 0 ? '+' : '') + growth + '%';
        growthPotentialEl.textContent = growthText;
        growthPotentialEl.className = growth >= 0 ? 'positive' : 'negative';
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
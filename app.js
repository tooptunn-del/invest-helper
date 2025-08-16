// Данные акций (с вашими справедливыми ценами)
const stocks = [
    {
        id: 1,
        ticker: "LKOH",
        name: "Лукойл",
        fairPrice: 8500.00
    },
    {
        id: 2,
        ticker: "ROSN",
        name: "Роснефть",
        fairPrice: 560.00
    },
    {
        id: 3,
        ticker: "SIBN",
        name: "Газпром нефть",
        fairPrice: 480.00
    },
    {
        id: 4,
        ticker: "TATN",
        name: "Татнефть",
        fairPrice: 680.00
    },
    {
        id: 5,
        ticker: "TATNP",
        name: "Татнефть ап",
        fairPrice: 670.00
    },
    {
        id: 6,
        ticker: "SNGSP",
        name: "Сургутнефтегаз ап",
        fairPrice: 60.00
    },
    {
        id: 7,
        ticker: "BANE",
        name: "Башнефть",
        fairPrice: 1950.00
    },
    {
        id: 8,
        ticker: "BANEP",
        name: "Башнефть ап",
        fairPrice: 1900.00
    },
    {
        id: 9,
        ticker: "GAZP",
        name: "Газпром",
        fairPrice: 180.00
    },
    {
        id: 10,
        ticker: "NVTK",
        name: "Новатэк",
        fairPrice: 1400.00
    },
    {
        id: 11,
        ticker: "SBER",
        name: "Сбербанк",
        fairPrice: 345.00
    },
    {
        id: 12,
        ticker: "SBERP",
        name: "Сбербанк ап",
        fairPrice: 335.00
    },
    {
        id: 13,
        ticker: "T",
        name: "Т-Технологии",
        fairPrice: 4200.00
    },
    {
        id: 14,
        ticker: "BSPB",
        name: "Банк Санкт-Петербург",
        fairPrice: 440.00
    },
    {
        id: 15,
        ticker: "SVCB",
        name: "Совкомбанк",
        fairPrice: 18.00
    },
    {
        id: 16,
        ticker: "VTBR",
        name: "ВТБ",
        fairPrice: 130.00
    },
    {
        id: 17,
        ticker: "MBNK",
        name: "МТС Банк",
        fairPrice: 1500.00
    },
    {
        id: 18,
        ticker: "RENI",
        name: "Ренессанс Страхование",
        fairPrice: 150.00
    },
    {
        id: 19,
        ticker: "LEAS",
        name: "Европлан",
        fairPrice: 850.00
    },
    {
        id: 20,
        ticker: "MOEX",
        name: "Московская биржа",
        fairPrice: 260.00
    },
    {
        id: 21,
        ticker: "SPBE",
        name: "СПб Биржа",
        fairPrice: 240.00
    },
    {
        id: 22,
        ticker: "ZAYM",
        name: "Займер",
        fairPrice: 140.00
    },
    {
        id: 23,
         ticker: "CARM",
        name: "СмартТехГрупп",
        fairPrice: 1.80
    },
    {
        id: 24,
        ticker: "SFIN",
        name: "SFI",
        fairPrice: 1600.00
    },
    {
        id: 25,
       ticker: "AFKS",
        name: "АФК Система",
        fairPrice: 18.00
    },
    {
        id: 26,
        ticker: "TRNFP",
        name: "Транснефть ап",
        fairPrice: 1700.00
    },
    {
        id: 27,
        ticker: "NMTP",
        name: "НМТП",
        fairPrice: 11.00
    },
    {
        id: 28,
        ticker: "FESH",
        name: "ДВМП",
        fairPrice: 50.00
    },
    {
        id: 29,
        ticker: "FLOT",
        name: "Совкомфлот",
        fairPrice: 70.00
    },
    {
        id: 30,
        ticker: "WUSH",
        name: "ВУШ",
        fairPrice: 330.00
    },
    {
        id: 31,
        ticker: "X5",
        name: "Корпоративный центр ИКС 5",
        fairPrice: 4200.00
    },
    {
        id: 32,
        ticker: "MGNT",
        name: "Магнит",
        fairPrice: 6600.00
    },
    {
        id: 33,
        ticker: "LENT",
        name: "Лента",
        fairPrice: 2300.00
    },
    {
        id: 34,
        ticker: "FIXP",
        name: "Fix Price",
        fairPrice: 200.00
    },
    {
        id: 35,
        ticker: "BELU",
        name: "Новабев",
        fairPrice: 620.00
    },
    {
        id: 36,
        ticker: "ABRD",
        name: "Абрау-Дюрсо",
        fairPrice: 250.00
    },
    {
        id: 37,
        ticker: "KLVZ",
        name: "АГ Кристалл",
        fairPrice: 3.50
    },
    {
        id: 38,
        ticker: "GCHE",
        name: "Черкизово",
        fairPrice: 3200.00
    },
    {
        id: 39,
        ticker: "RAGR",
        name: "Русагро",
        fairPrice: 140.00
    },
    {
        id: 40,
        ticker: "AQUA",
        name: "Инарктика",
        fairPrice: 900.00
    },
    {
        id: 41,
        ticker: "YDEX",
        name: "Яндекс",
        fairPrice: 6800.00
    },
    {
        id: 42,
        ticker: "POSI",
        name: "Группа Позитив",
        fairPrice: 1800.00
    },
    {
        id: 43,
        ticker: "HEAD",
        name: "Хэдхантер",
        fairPrice: 5000.00
    },
    {
        id: 44,
        ticker: "VKCO",
        name: "ВК",
        fairPrice: 140.00
    },
    {
        id: 45,
        ticker: "ASTR",
        name: "Астра",
        fairPrice: 600.00
    },
    {
        id: 46,
        ticker: "ELMT",
        name: "ГК Элемент",
        fairPrice: 0.21
    },
    {
        id: 47,
        ticker: "IVAT",
        name: "ИВА",
        fairPrice: 300.00
    },
    {
        id: 48,
        ticker: "DATA",
        name: "Аренадата",
        fairPrice: 150.00
    },
    {
        id: 49,
        ticker: "DIAS",
        name: "Диасофт",
        fairPrice: 3900.00
    },
    {
        id: 50,
        ticker: "RTKM",
        name: "Ростелеком",
        fairPrice: 75.00
    },
    {
        id: 51,
        ticker: "RTKMP",
        name: "Ростелеком ап",
        fairPrice: 85.00
    },
    {
        id: 52,
        ticker: "MTSS",
        name: "МТС",
        fairPrice: 250.00
    },
    {
        id: 53,
        ticker: "PLZL",
        name: "Полюс",
        fairPrice: 2500.00
    },
    {
        id: 54,
        ticker: "UGLD",
        name: "ЮГК",
        fairPrice: 0.57
    },
    {
        id: 55,
        ticker: "SELG",
        name: "Селигдар",
        fairPrice: 65.00
    },
    {
        id: 56,
        ticker: "LNZL",
        name: "Лензолото",
        fairPrice: 350.00
    },
    {
        id: 57,
        ticker: "GMKN",
        name: "Норникель",
        fairPrice: 150.00
    },
    {
        id: 58,
        ticker: "VSMO",
        name: "ВСМПО-Ависма",
        fairPrice: 24000.00
    },
    {
        id: 59,
        ticker: "RUAL",
        name: "Русал",
        fairPrice: 50.00
    },
    {
        id: 60,
        ticker: "ALRS",
        name: "Алроса",
        fairPrice: 75.00
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
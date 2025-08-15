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
    
    // Простая функция для рендеринга акций
    function renderStocks(filter = '') {
        console.log("Рендерим список акций");
        stocksList.innerHTML = '';
        
        const filteredStocks = filter ? 
            stocks.filter(stock => 
                stock.name.toLowerCase().includes(filter) || 
                stock.ticker.toLowerCase().includes(filter)
            ) : 
            stocks;
        
        filteredStocks.forEach(stock => {
            const stockItem = document.createElement('div');
            stockItem.className = 'stock-item';
            stockItem.innerHTML = `
                <div class="stock-info">
                    <div class="stock-name">${stock.name}</div>
                    <div class="stock-ticker">${stock.ticker}</div>
                </div>
                <div class="stock-price">${stock.currentPrice.toFixed(2)} RUB</div>
            `;
            
            stockItem.addEventListener('click', () => {
                showStockDetail(stock);
            });
            
            stocksList.appendChild(stockItem);
        });
    }
    
    // Показать детали акции
    function showStockDetail(stock) {
        console.log("Показываем детали для:", stock.name);
        
        mainScreen.classList.add('hidden');
        detailScreen.classList.remove('hidden');
        backButton.classList.remove('hidden');
        appTitle.textContent = stock.name;
        
        stockName.textContent = stock.name;
        stockTickerEl.textContent = stock.ticker;
        currentPriceValue.textContent = stock.currentPrice.toFixed(2) + ' RUB';
        
        // Рассчитываем изменение цены
        const priceChangeValue = stock.currentPrice - stock.initialPrice;
        const priceChangePercent = ((priceChangeValue / stock.initialPrice) * 100).toFixed(2);
        
        priceChange.textContent = `${priceChangeValue >= 0 ? '+' : ''}${priceChangeValue.toFixed(2)} (${priceChangePercent}%)`;
        priceChange.className = priceChangeValue >= 0 ? 'positive' : 'negative';
        
        // Справедливая цена и потенциал роста
        fairPriceEl.textContent = stock.fairPrice.toFixed(2) + ' RUB';
        
        const growth = ((stock.fairPrice - stock.currentPrice) / stock.currentPrice * 100).toFixed(2);
        growthPotentialEl.textContent = (growth > 0 ? '+' : '') + growth + '%';
        growthPotentialEl.className = growth >= 0 ? 'positive' : 'negative';
        
        // Инициализация простого графика
        initSimpleChart();
    }
    
    // Инициализация простого графика
    function initSimpleChart() {
        const ctx = document.getElementById('simple-chart').getContext('2d');
        
        // Простой линейный график
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл'],
                datasets: [{
                    label: 'Цена акции',
                    data: [290, 295, 292, 298, 302, 300, 305],
                    borderColor: '#2575fc',
                    backgroundColor: 'rgba(37, 117, 252, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
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
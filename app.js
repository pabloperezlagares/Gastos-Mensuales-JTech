const STORAGE_KEY = 'monthly-expenses-app';

function getCategoryOptions() {
  return ['Comida', 'Transporte', 'Vivienda', 'Salud', 'Ocio', 'Educación', 'Otros'];
}

function calculateMonthSummary(expenses, month) {
  const filtered = expenses.filter((expense) => expense.date.startsWith(month));
  const total = filtered.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const byCategory = filtered.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});

  return { total, byCategory };
}

function buildAiPrompt(expenses, month) {
  const summary = calculateMonthSummary(expenses, month);
  const categoryLines = Object.entries(summary.byCategory)
    .map(([category, amount]) => `- ${category}: ${amount.toFixed(2)}€`)
    .join('\n');

  return `Analiza mis gastos del mes ${month}.\nTotal gastado: ${summary.total.toFixed(2)}€.\nPor categorías:\n${categoryLines || '- Sin gastos'}\n\nHaz una respuesta breve, útil y en español, con consejos para ahorrar.`;
}

function loadExpenses() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('No se pudieron cargar los gastos', error);
    return [];
  }
}

function saveExpenses(expenses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function createExpense({ description, category, amount, date }) {
  return {
    id: crypto.randomUUID(),
    description,
    category,
    amount: Number(amount),
    date
  };
}

function filterExpenses(expenses, filters = {}) {
  const { date = '', category = '' } = filters;
  return expenses.filter((expense) => {
    const matchesDate = !date || expense.date === date;
    const matchesCategory = !category || expense.category === category;

    return matchesDate && matchesCategory;
  });
}

function removeExpense(expenses, id) {
  return expenses.filter((expense) => expense.id !== id);
}

function updateUi() {
  const expenses = loadExpenses();
  const dateInput = document.getElementById('date-input');
  const categoryFilter = document.getElementById('category-filter');
  const date = dateInput ? dateInput.value : '';
  const category = categoryFilter ? categoryFilter.value : '';
  const filteredExpenses = filterExpenses(expenses, { date, category });
  const summary = calculateMonthSummary(expenses, '');
  const month = date ? date.slice(0, 7) : '';

  const list = document.getElementById('expenses-list');
  const totalEl = document.getElementById('total');
  const categoriesEl = document.getElementById('categories');
  const aiOutputEl = document.getElementById('ai-output');
  const aiButton = document.getElementById('ai-button');
  const apiKeyInput = document.getElementById('api-key');
  const emptyStateEl = document.getElementById('expenses-empty-state');

  if (list) {
    list.innerHTML = '';
    if (filteredExpenses.length === 0) {
      if (emptyStateEl) {
        emptyStateEl.style.display = 'block';
        emptyStateEl.textContent = 'No hay gastos que coincidan con el filtro actual.';
      }
      list.innerHTML = '<li class="empty">No hay gastos que coincidan con el filtro actual.</li>';
    } else {
      if (emptyStateEl) {
        emptyStateEl.style.display = 'none';
      }
      filteredExpenses.forEach((expense) => {
        const item = document.createElement('li');
        item.className = 'expense-item';
        item.innerHTML = `
          <div class="expense-main">
            <span class="expense-description">${expense.description}</span>
            <strong class="expense-amount">${Number(expense.amount).toFixed(2)}€</strong>
          </div>
          <div class="expense-meta">
            <small>${expense.category} • ${expense.date}</small>
            <button type="button" class="remove-button" data-id="${expense.id}">Eliminar</button>
          </div>
        `;
        list.appendChild(item);
      });
    }
  }

  if (totalEl) {
    totalEl.textContent = `${summary.total.toFixed(2)}€`;
  }

  if (categoriesEl) {
    categoriesEl.innerHTML = Object.entries(summary.byCategory)
      .map(([category, amount]) => `<li>${category}: ${amount.toFixed(2)}€</li>`)
      .join('');
  }

  if (aiButton) {
    aiButton.onclick = async () => {
      if (aiOutputEl) {
        aiOutputEl.textContent = 'Consultando a la IA...';
      }

      const apiKey = (apiKeyInput?.value || '').trim();
      if (!apiKey) {
        if (aiOutputEl) {
          aiOutputEl.textContent = 'Introduce una clave API de OpenAI para continuar.';
        }
        return;
      }

      const prompt = buildAiPrompt(expenses, month);
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Responde en español y de forma breve.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7
          })
        });

        if (!response.ok) {
          throw new Error('La API no respondió correctamente');
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || 'No se obtuvo respuesta.';
        if (aiOutputEl) {
          aiOutputEl.textContent = content;
        }
      } catch (error) {
        if (aiOutputEl) {
          aiOutputEl.textContent = 'No se pudo contactar con la IA. Revisa la clave API o prueba más tarde.';
        }
        console.error(error);
      }
    };
  }
}

function setupApp() {
  const form = document.getElementById('expense-form');
  const filtersForm = document.getElementById('filters-form');
  const clearFiltersButton = document.getElementById('clear-filters-button');
  const dateInput = document.getElementById('date-input');
  const categoryFilter = document.getElementById('category-filter');
  const resetButton = document.getElementById('reset-button');
  const categorySelect = document.getElementById('category');

  if (categorySelect) {
    categorySelect.innerHTML = [
      '<option value="" disabled selected>Selecciona una categoría</option>',
      ...getCategoryOptions().map((category) => `<option value="${category}">${category}</option>`)
    ].join('');
  }

  if (categoryFilter) {
    categoryFilter.innerHTML = [
      '<option value="">Todas</option>',
      ...getCategoryOptions().map((category) => `<option value="${category}">${category}</option>`)
    ].join('');
  }

  if (form) {
    const handleExpenseSubmit = (event) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      const formData = new FormData(form);
      const expense = createExpense({
        description: formData.get('description').toString().trim(),
        category: formData.get('category').toString().trim(),
        amount: formData.get('amount'),
        date: formData.get('date').toString()
      });

      if (!expense.description || !expense.category || !expense.amount) {
        alert('Completa todos los campos');
        return;
      }

      const expenses = loadExpenses();
      expenses.push(expense);
      saveExpenses(expenses);
      form.reset();
      updateUi();
    };

    form.addEventListener('submit', handleExpenseSubmit);
  }

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      const confirmed = window.confirm('¿Seguro que quieres borrar todos los datos?');
      if (!confirmed) {
        return;
      }

      localStorage.removeItem(STORAGE_KEY);
      updateUi();
    });
  }

  if (filtersForm) {
    filtersForm.addEventListener('submit', (event) => {
      event.preventDefault();
      updateUi();
    });
  }

  if (clearFiltersButton) {
    clearFiltersButton.addEventListener('click', () => {
      if (dateInput) {
        dateInput.value = '';
      }

      if (categoryFilter) {
        categoryFilter.value = '';
      }

      updateUi();
    });
  }

  if (dateInput) {
    dateInput.addEventListener('change', updateUi);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', updateUi);
  }

  document.addEventListener('click', (event) => {
    const removeButton = event.target.closest('.remove-button');
    if (!removeButton) {
      return;
    }

    const expenses = loadExpenses();
    const updatedExpenses = removeExpense(expenses, removeButton.dataset.id);
    saveExpenses(updatedExpenses);
    updateUi();
  });

  updateUi();
}

if (typeof module !== 'undefined') {
  module.exports = { calculateMonthSummary, buildAiPrompt, getCategoryOptions, filterExpenses, removeExpense };
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', setupApp);
}

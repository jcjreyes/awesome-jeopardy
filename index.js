const buildJeopardyBoard = (jeopardyList) => {
  // Build the question board using Document Fragments
  const base = document.createDocumentFragment();
  const table = document.createElement('table');
  base.append(table);

  // Create category headers
  const tableHeader = document.createElement('tr');
  for (let i = 0; i < 5; i++) {
    let columnQuestion = document.createElement('th');
    columnQuestion.dataset.categoryTitle = jeopardyList[i].title;
    columnQuestion.dataset.categoryId = jeopardyList[i].id;
    columnQuestion.textContent = jeopardyList[i].title;

    tableHeader.append(columnQuestion);
  }

  table.append(tableHeader);

  console.log(base);
  for (let i = 0; i < 5; i++) {
    const tableRow = document.createElement('tr');
    for (let j = 0; j < 5; j++) {
      const question = jeopardyList[j].questions[i];
      const tableCell = document.createElement('td');
      // Only the Value of the question is shown
      tableCell.textContent = question.value == null ? 0 : question.value;
      tableCell.dataset.question = question.question;
      tableCell.dataset.categoryId = question.category_id;
      tableCell.dataset.answer = question.answer;
      tableCell.dataset.value = question.value || 0;

      tableCell.addEventListener(
        'click',
        (event) => {
          // DOM TRAVERSAL!!!!!!!!!!!!!!!
          const selectedQuestion =
            event.currentTarget.parentElement.parentElement.parentElement
              .children[0].children[1];
          // Clicking on the question will show the question in a separate box.
          selectedQuestion.textContent = tableCell.dataset.question;
          // Question and Answer should be found in one element only
          selectedQuestion.setAttribute(
            'data-question',
            tableCell.dataset.question,
          );
          selectedQuestion.setAttribute('data-value', tableCell.dataset.value);
          selectedQuestion.setAttribute(
            'data-answer',
            tableCell.dataset.answer,
          );
          console.log(selectedQuestion);
          // Remove a selected question from the board instead of just disabling the click.
          // Since it is a table, deleting the cell itself would shift all cells to the left.
          event.currentTarget.textContent = '';
        },
        // The box in the grid that was clicked should not be clickable again.
        { once: true },
      );
      tableRow.append(tableCell);
    }
    table.append(tableRow);
  }

  document.querySelector('body').appendChild(table);

  const input = document.querySelector('#answer-input');
  let totalScore = 0;

  input.addEventListener('keyup', (event) => {
    // Updating the question box (where the question is shown after click) and 
    // the score should be done using DOM Traversal instead of simply querying 
    // for the class.
    const selectedQuestion = event.currentTarget.previousElementSibling;
    const currentScore =
      event.currentTarget.nextElementSibling.nextElementSibling;
    if (event.key === 'Enter') {
      const question = selectedQuestion.getAttribute('data-question');
      const value = parseInt(selectedQuestion.getAttribute('data-value'));
      const answer = selectedQuestion.getAttribute('data-answer');
      // Use data-* attributes to keep track of the question being displayed and its corresponding value
      selectedQuestion.setAttribute('data-question', '');
      selectedQuestion.setAttribute('data-value', '');
      selectedQuestion.setAttribute('data-answer', '');
      selectedQuestion.textContent = '';
      console.log(question, value, answer);
      console.log(currentScore);

      // When the answer is put in, and the  "enter" key has been pressed, update the score accordingly.
      if (input.value == answer) {
        totalScore += parseInt(value);
        currentScore.textContent = totalScore;
        selectedQuestion.textContent = 'Correct!';
      } else {
        selectedQuestion.textContent = 'Wrong...'
      }

      input.value = '';
    }
  });
};

fetch('http://jservice.io/api/categories?count=5&offset=10')
  .then((res) => res.json())
  .then(async (data) => {
    return Promise.all(
      data.map(async (category) => {
        const res = await fetch(
          `http://jservice.io/api/clues?category=${category.id}`,
        );
        const cluesData = await res.json();

        category.questions = cluesData.slice(0, 5);
        return category;
      }),
    );
  })
  .then((jeopardyList) => {
    console.log(jeopardyList);
    buildJeopardyBoard(jeopardyList);
  });

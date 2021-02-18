<template>
    <table>
        <tr>
            <th class="empty"></th>
            <th v-for="(column, index) in sheetContent[0]" :key="index">{{ index }}</th>
        </tr>
        <tr v-for="(row, rowIndex) in sheetContent" :key="rowIndex">
            <td class="sidebar">{{ rowIndex }}</td>
            <td v-for="(cell, cellIndex) in row"
            :tabindex="0"
            :key="cellIndex"
            @focus="selectCell(`${rowIndex}-${cellIndex}`)"
            @dblclick="selectForEditing"
            :class="{ selected: isSelected(`${rowIndex}-${cellIndex}`), edit: currentCell != null && currentCell == editCell}"
            @contextmenu="cellOptions($event, `${rowIndex}-${cellIndex}`)"
            >
                {{ getValue(`${rowIndex}-${cellIndex}`) }}
                <textarea
                rows="1"
                v-if="editCell == `${rowIndex}-${cellIndex}`"
                :tabindex="-1"
                :ref="`${rowIndex}-${cellIndex}`"
                v-model="currentValue"
                @keyup="setValue"
                @keydown.enter="unselectForEditing"
                @keydown.esc="unselectForEditing"
                @blur="unselectForEditing"
                />
                <div v-if="options == `${rowIndex}-${cellIndex}`" class="context-menu options">
                  <button @click="selectForEditing">Edit</button>
                  <button @click="setValue(null, '='); selectForEditing($event)">Function</button>
                </div>
                <div v-if="functionTooltips == `${rowIndex}-${cellIndex}`" class="context-menu function-options">
                  <small>Writing a function</small>
                  <div v-if="functionTooltipStep == 0 && !functionError">
                    Please select your first cell
                  </div>
                  <div v-if="functionTooltipStep == 1 && !functionError">
                    Please choose a function
                  </div>
                  <button v-if="functionTooltipStep == 1 && !functionError">
                    +
                  </button>
                  <button v-if="functionTooltipStep == 1 && !functionError">
                    -
                  </button>
                  <div v-if="functionTooltipStep == 3 && !functionError">
                    Please select your last cell
                  </div>
                  <div v-if="functionTooltipStep == 4 && !functionError">
                    result: <strong>{{ getValue(`${rowIndex}-${cellIndex}`) }}</strong>
                  </div>
                  <div v-if="functionError" class="error">
                    {{ functionError }}
                    </div>
                </div>
            </td>
        </tr>
    </table>
</template>

<script>
export default {
  data () {
    return {
      currentCell: null,
      editCell: null,
      options: null,
      functionTooltips: null,
      functionTooltipStep: 0,
      functionError: null,
      isWritingFunction: false,
      currentValue: '',
      sheetContent: [
        ['0', '=(1-1)-(2-2)', '', '5'],
        ['1', '', '', '5'],
        ['1', '', '6', '5']
      ]
    }
  },
  mounted: function () {
    addEventListener('keyup', (e) => {
      if (this.editCell) return
      const controlKeys = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft']
      if (e.code === 'Space') {
        this.selectForEditing()
        return 'edit cell'
      }
      if (e.code === 'Backspace' && this.currentCell) {
        this.setValue(null, '')
        return 'clear cell'
      }
      if (e.key.length === 1 && this.currentCell) {
        this.setValue(null, e.key)
        this.selectForEditing()
        return 'set new value to cell'
      }
      if (controlKeys.indexOf(e.code) >= 0 && !this.editCell) {
        let currentRow = this.currentCell ? this.currentCell.split('-')[0] : 0
        let currentCol = this.currentCell ? this.currentCell.split('-')[1] : 0
        this.unselectForEditing(e)
        if (this.currentCell !== null) {
          switch (e.code) {
            case 'ArrowUp':
              currentRow--
              break
            case 'ArrowDown':
              currentRow++
              break
            case 'ArrowRight':
              currentCol++
              break
            case 'ArrowLeft':
              currentCol--
              break
          }
        }
        this.moveTo(`${currentRow}-${currentCol}`)
        return 'moving to another cell'
      }
    })
  },
  methods: {
    selectCell: function (key) {
      this.closeOptions()
      this.currentCell = key
      if (this.editCell !== key) this.editCell = null
    },
    isSelected: function (key) {
      return this.currentCell === key
    },
    selectForEditing: function () {
      this.closeOptions()
      this.editCell = this.currentCell
      this.currentValue = this.getValue(this.currentCell, true)
      this.$nextTick(() => {
        this.$refs[this.currentCell][0].focus()
      })
      if (this.currentValue.startsWith('=')) {
        this.functionTooltips = this.currentCell
      }
      if (this.checkIfFunction(this.currentValue)) {
        this.functionTooltipStep = 4
        this.isWritingFunction = true
      }
    },
    getValue: function (key, crude = false) {
      const row = key.split('-')[0]
      const col = key.split('-')[1]
      let value = 0
      const currentRow = this.sheetContent[row]
      if (currentRow === undefined || col >= currentRow.length || !col) {
        return { error: 'Selected cell out of range' }
      }
      value = this.sheetContent[row][col]
      if (this.checkIfFunction(value) && !crude) {
        return this.calculateValue(value)
      }
      return value
    },
    unselectForEditing: function (e) {
      e.preventDefault()
      this.closeTooltips()
      this.editCell = null
    },
    setValue: function (e = null, val = null) {
      if (e && e.key.length > 1 && e.key !== 'Backspace') return
      const newValue = val ?? e.target?.value ?? '' // Optional chaining
      const row = this.currentCell.split('-')[0]
      const col = this.currentCell.split('-')[1]
      this.sheetContent[row][col] = newValue
      this.$forceUpdate()

      if (newValue.startsWith('=')) {
        this.functionTooltips = this.currentCell
        this.isWritingFunction = true
        this.functionError = null
      } else {
        this.closeTooltips()
      }
    },
    moveTo: function (newPos) {
      this.closeOptions()
      this.closeTooltips()
      const row = newPos.split('-')[0]
      const col = newPos.split('-')[1]
      if (row === '' || col === '') return
      if (row < 0 || col < 0) return
      if (this.sheetContent.length <= row || this.sheetContent[0].length <= col) return
      this.currentCell = newPos
    },
    cellOptions: function (e, cell) {
      e.preventDefault()
      if (this.currentCell !== cell) this.selectCell(cell)
      this.options = cell
    },
    closeOptions: function () {
      this.options = null
    },
    closeTooltips: function () {
      this.functionTooltips = null
    },
    checkIfFunction (value) {
      const expected = ['=(-)-(-)', '=(-)+(-)']
      const actual = value.replace(/[0-9\s]/g, '')
      return expected.indexOf(actual) >= 0
    },
    calculateValue (func) {
      const cellRegExp = /\(.*?\)/g // Regular expresion to match everything inside parentheses
      const firstCell = cellRegExp.exec(func)[0].replace(/[()]/g, '')
      const secondCell = cellRegExp.exec(func)[0].replace(/[()]/g, '')
      if ((firstCell === this.currentCell || this.secondCell === this.currentCell) && this.editCell) {
        this.functionError = "You should pick a cell that isn't the current one"
        return 0
      }

      let firstValue = this.getValue(firstCell)
      let secondValue = this.getValue(secondCell)

      if (firstValue.error || secondValue.error) {
        this.functionError = firstValue.error || secondValue.error
        return 0
      }
      this.functionError = null

      firstValue = parseInt(firstValue) || 0
      secondValue = parseInt(secondValue) || 0

      const operatorRegExp = /\).*?\(/
      const operator = operatorRegExp.exec(func)[0]?.replace(/[()]/g, '')
      if (operator === '+') return firstValue + secondValue
      return firstValue - secondValue
    }
  }
}
</script>

<style>
    table {
      table-layout: fixed;
      width: 2rem;
      border-spacing: 0;
      width: 100%;
      min-width: 800px;
      box-shadow: 0px 0px 15px 2px #00000027;
    }
    th, td {
      border: .5px solid #888888;
      user-select: none;
      position: relative;
      height: 2.5rem;
      overflow: hidden;
      outline: 0;
    }
    td {
      cursor: pointer;
      overflow: visible;
    }
    th.empty,
    td.sidebar {
      width: 2rem;
    }
    td textarea {
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      resize: none;
      outline: none !important;
      border-radius: 0;
      white-space: nowrap;
    }
    .selected {
      border: 2px solid #439aff;
      background-color: #f3f3f3;
      z-index: 2;
    }
    .context-menu {
      position: absolute;
      top: 100%;
      right: 0;
      left: 0;
      box-shadow: 0px 0px 15px 2px #00000027;
      display: flex;
      flex-direction: column;
      padding: 10px 15px;
      border: 1px solid #888;
      gap: 10px;
      background-color: #fff;
      cursor: default;
    }
    .context-menu > button {
      cursor: pointer;
    }
    .context-menu > .error {
      color: #ff5858;
    }
</style>

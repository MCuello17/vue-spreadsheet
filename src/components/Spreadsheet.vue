<template>
  <table>
    <spread-sheet-header :headerContent="sheetContent[0]" />
    <tr
      v-for="(row, rowIndex) in sheetContent"
      :key="rowIndex">
      <spread-sheet-sidebar :value="rowIndex"/>
      <td
        v-for="(cell, cellIndex) in row"
        :tabindex="0"
        :key="cellIndex"
        @focus="selectCell(`${rowIndex}-${cellIndex}`)"
        @dblclick="selectForEditing"
        :class="{ selected: isSelected(`${rowIndex}-${cellIndex}`), edit: editCell === `${rowIndex}-${cellIndex}`}"
        @contextmenu="cellOptions($event, `${rowIndex}-${cellIndex}`)">
        {{ cell.startsWith('=') ? getValue(`${rowIndex}-${cellIndex}`) : cell }}
        <spreadsheet-cell
          :ref="`${rowIndex}-${cellIndex}`"
          :editCell="editCell"
          :options="options"
          :functionTooltips="functionTooltips"
          :functionTooltipStep="functionTooltipStep"
          :functionError="functionError"
          :cellKey="`${rowIndex}-${cellIndex}`"
          :currentValue="currentValue"
          @add-to-value="addToValue"
          @set-value="setValue(...$event)"
          @select-for-editing="selectForEditing"
          @unselect-for-editing="unselectForEditing"/>
      </td>
    </tr>
  </table>
</template>

<script>
import SpreadsheetCell from './SpreadsheetCell.vue'
import SpreadSheetHeader from './SpreadSheetHeader.vue'
import SpreadSheetSidebar from './SpreadSheetSidebar.vue'
export default {
  components: { SpreadsheetCell, SpreadSheetHeader, SpreadSheetSidebar },
  data () {
    return {
      currentCell: null,
      editCell: null,
      options: null,
      functionTooltips: null,
      functionTooltipStep: {},
      functionError: {},
      isWritingFunction: false,
      currentValue: '',
      sheetContent: [
        ['0', '1', '', '5', '17', '1', ''],
        ['2021', '', '8', '=(1-0)-(4-2)', '', '9', ''],
        ['', '3', '', '4', '22', '', '5005'],
        ['', '', '5', '10', '5', '434', ''],
        ['17', '1', '1998', '', '2', '6', ''],
        ['8', '', '', '7', '', '', '9']
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
      if (this.isWritingFunction) {
        if (this.editCell === key) {
          this.selectForEditing()
          return
        }
        if (this.functionTooltipStep[this.editCell] !== 0 && this.functionTooltipStep[this.editCell] !== 2) {
          this.unselectForEditing()
          return
        }
        this.addToValue(`(${key})`)
        return
      }

      if (this.editCell !== key) {
        this.unselectForEditing()
      } else {
        this.$refs[key][0].focus()
      }
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
        this.$refs[this.currentCell][0].$refs.textarea.focus()
      })
      if (this.currentValue.startsWith('=')) {
        this.functionTooltips = this.currentCell
      }
    },
    getValue: function (key, crude = false) {
      const row = key.split('-')[0]
      const col = key.split('-')[1]
      const currentRow = this.sheetContent[row]
      if (currentRow === undefined || col >= currentRow.length || !col) {
        return { error: 'Selected cell out of range' }
      }
      const value = this.sheetContent[row][col]
      if (this.checkIfFunction(value, key) && !crude && this.functionTooltipStep[key] >= 3) {
        return this.calculateValue(value, key)
      }
      return value
    },
    unselectForEditing: function () {
      this.closeTooltips()
      this.editCell = null
      this.isWritingFunction = false
    },
    setValue: function (e = null, val = null) {
      if (e && e.key.length > 1 && e.key !== 'Backspace') return
      const newValue = val ?? e.target?.value ?? '' // Optional chaining
      const row = this.currentCell.split('-')[0]
      const col = this.currentCell.split('-')[1]
      this.sheetContent[row][col] = newValue
      this.currentValue = newValue

      if (newValue.startsWith('=')) {
        this.functionTooltips = this.currentCell
        this.checkIfFunction(newValue, this.currentCell)
      } else {
        this.closeTooltips()
      }
      this.$forceUpdate()
    },
    addToValue: function (newToValue) {
      const key = this.currentCell
      let finalValue = this.getValue(key, true)
      finalValue += newToValue
      this.setValue(null, finalValue)
      this.selectForEditing()
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
      if (this.isWritingFunction) return
      if (this.currentCell !== cell) this.selectCell(cell)
      this.options = cell
    },
    closeOptions: function () {
      this.options = null
    },
    closeTooltips: function () {
      this.functionTooltips = null
    },
    checkIfFunction (value, key = null) {
      const finalStep = /=\(\d+-\d+\)[+-]\(\d+-\d+\)$/
      key = key || this.currentCell
      this.validateFunction(value, key)
      if (this.editCell === key) this.isWritingFunction = true
      if (finalStep.test(value)) {
        this.functionTooltipStep[key] = 3
        if (this.editCell === key) this.isWritingFunction = false
        return true
      }
      const thirdStep = /=\(\d+-\d+\)[+-]\(?(\d+)?-?(\d+)?$/
      if (thirdStep.test(value)) {
        this.functionTooltipStep[key] = 2
        return true
      }
      const secondStep = /=\(\d+-\d+\)$/
      if (secondStep.test(value)) {
        this.functionTooltipStep[key] = 1
        return true
      }
      const firstStep = /=(\((\d+)?-?(\d+)?$)|(=$)/
      if (firstStep.test(value)) {
        this.functionTooltipStep[key] = 0
        return true
      }
      if (this.editCell === key) this.isWritingFunction = false
      if (value.startsWith('=') && value.length > 1) {
        this.functionError[key] = 'Unknown function'
      }
      delete this.functionTooltipStep[key]
      return false
    },
    validateFunction (func, key) {
      delete this.functionError[key]
      const cellRegExp = /\(\d+-\d+\)/g // Regular expresion to match everything inside parentheses
      let firstCell = null
      let secondCell = null
      try {
        firstCell = cellRegExp.exec(func)[0].replace(/[()]/g, '')
        secondCell = cellRegExp.exec(func)[0].replace(/[()]/g, '')
      } catch (error) {
        return
      }
      if (firstCell === key || secondCell === key) {
        this.functionError[key] = "You should pick a cell that isn't the current one"
        return
      }
      const firstValue = this.getValue(firstCell)
      const secondValue = this.getValue(secondCell)

      if (firstValue.error || secondValue.error) {
        this.functionError[key] = firstValue.error || secondValue.error
        return 0
      }
      return { firstValue, secondValue }
    },
    calculateValue (func, key) {
      const validation = this.validateFunction(func, key)
      if (this.functionError[key]) return 0
      delete this.functionError[key]

      let { secondValue, firstValue } = validation

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
      border: 1px solid #bbb;
    }
    th, td {
      border: .5px solid #f3f3f3;
      user-select: none;
      position: relative;
      height: 2.5rem;
      overflow: hidden;
      outline: 0;
    }
    th {
      border-bottom: 1px solid #bbb;
    }
    td {
      cursor: pointer;
      overflow: visible;
    }
    th.empty,
    td.sidebar {
      width: 2rem;
      cursor: default;
    }
    th.empty {
      background-color: #bbbbbb;
    }
    td.sidebar {
      font-weight: bold;
      border-right: 1px solid #bbb;
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
    .edit {
      cursor: text;
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
      opacity: 1;
      z-index: 10;
    }
    .context-menu > button {
      bottom: calc(100% + 2.5rem);
      top: auto;
      cursor: pointer;
      outline: none;
      border: 1px solid #bbb;
      padding: 5px 2px;
      background-color: #f3f3f3;
      font-weight: bold;
    }
    .context-menu button:hover {
      border: 1px solid #439aff;
    }
    .context-menu small {
      font-weight: bold;
    }
    .context-menu > .error {
      color: #ff5858;
    }
</style>

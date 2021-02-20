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
    selectCell: function (key) { // Selects the cell from param
      if (this.isWritingFunction) { // If the user is writing a function we want a different functionality
        if (this.editCell === key) {
          this.selectForEditing() // Continue editing
          return
        }
        if (this.functionTooltipStep[this.editCell] !== 0 && this.functionTooltipStep[this.editCell] !== 2) { // if we are not in the steps for selecting cells unselect the current
          this.unselectForEditing()
          return
        }
        this.addToValue(`(${key})`) // Add the key of the cell to the function
        return
      }

      if (this.editCell !== key) { // Unselect the cell if selected cell is not the current one
        this.unselectForEditing()
      } else {
        this.$refs[key][0].$refs.textarea.focus() // Focus on the textarea
      }
      this.closeOptions() // Close context menu
      this.currentCell = key // Change current cell to the selected one
      if (this.editCell !== key) this.editCell = null // Disable editing if the selected cell is different than the current one
    },
    isSelected: function (key) { // Checks if the current cell is the same from param
      return this.currentCell === key
    },
    selectForEditing: function () { // Se;ects the current cell for editing
      this.closeOptions() // Close context menu
      this.editCell = this.currentCell // Sets the editing cell as the current one
      this.currentValue = this.getValue(this.currentCell, true) // Sets the current value as the one from the cell (for the textarea to be populated)
      this.$nextTick(() => { // We use nexttick because the textarea doesn't exist until then
        this.$refs[this.currentCell][0].$refs.textarea.focus() // Focus on the textarea
      })
      if (this.currentValue.startsWith('=')) { // If the value starts with "=" the user is writing a function
        this.functionTooltips = this.currentCell // Set functionTooltips to the current cell
      }
    },
    getValue: function (key, crude = false) { // Returns the value of the cell
      const row = key.split('-')[0] // Get row and column from the key (row-col)
      const col = key.split('-')[1]
      const currentRow = this.sheetContent[row]
      if (currentRow === undefined || col >= currentRow.length || !col) { // Check if the row or the col are outside of the content
        return { error: 'Selected cell out of range' }
      }
      const value = this.sheetContent[row][col] // Set the value as the actual value from the content
      if (this.checkIfFunction(value, key) && !crude && this.functionTooltipStep[key] >= 3) { // If the value is a function, we don't want the crude value and the function is done we need to calculate the final value
        return this.calculateValue(value, key)
      }
      return value
    },
    unselectForEditing: function () { // Unselect the current cell for editing
      this.closeTooltips() // Close the context menu
      this.editCell = null // Disable edit cell
      this.isWritingFunction = false // The user is not writing a function
    },
    setValue: function (e = null, val = null) { // Sets a value to the cell
      if (e && e.key.length > 1 && e.key !== 'Backspace') return // If the value comes from an event (keypress) but that event is other than the backspace or a "character" key we ignore it
      const newValue = val ?? e.target?.value ?? '' // Optional chaining to set the new value to the passed value or to the value from the keypress event
      const row = this.currentCell.split('-')[0] // Get row and column from the key (row-col)
      const col = this.currentCell.split('-')[1]
      this.sheetContent[row][col] = newValue // Sets the value of the row to the new one
      this.currentValue = newValue // Change currentValue for the textarea to update

      if (newValue.startsWith('=')) { // If the new value is a function
        this.functionTooltips = this.currentCell // Show the function tooltips
        this.checkIfFunction(newValue, this.currentCell) // Check if the current value is a function
      } else {
        this.closeTooltips()
      }
      this.$forceUpdate() // We need to force update for the tooltips to show and the value to update on the textareas
    },
    addToValue: function (newToValue) { // Adds the param to the current value
      const key = this.currentCell // Grab current cell key
      let finalValue = this.getValue(key, true) // Grab the current value of the cell
      finalValue += newToValue // Add the new value to the current value
      this.setValue(null, finalValue) // Sets the value to the cell
      this.selectForEditing() // Select the cell for editing in case the user wasn't editing before
    },
    moveTo: function (newPos) { // Move to a new position
      this.closeOptions() // Close all context menus
      this.closeTooltips()
      const row = newPos.split('-')[0] // Get row and column from the key (row-col)
      const col = newPos.split('-')[1]
      if (row === '' || col === '') return // If the new position had an empty value ignore it
      if (row < 0 || col < 0) return // If the new position had negative values ignore it
      if (this.sheetContent.length <= row || this.sheetContent[0].length <= col) return // If the new position is outside of the sheet content ignore it
      this.currentCell = newPos // Move the current position to the new one
    },
    cellOptions: function (e, cell) { // Show the context menu
      e.preventDefault() // prevent the right click default menu
      if (this.isWritingFunction) return // If the user is writing a function ignore the right click
      if (this.currentCell !== cell) this.selectCell(cell) // If the cell where the user right clicked is not the current one move to that one
      this.options = cell // Set the context menu options as the current cell
    },
    closeOptions: function () { // Close the context menu
      this.options = null
    },
    closeTooltips: function () { // Close the function tooltips
      this.functionTooltips = null
    },
    checkIfFunction (value, key = null) { // Check if the value is a function
      const finalStep = /=\(\d+-\d+\)[+-]\(\d+-\d+\)$/ // Regex for the final step =(x-y)±(x-y)
      key = key || this.currentCell // Set key as the parameter or the current cell
      this.validateFunction(value, key) // Validate the function
      if (this.editCell === key) this.isWritingFunction = true // if the current cell is the same as the param key the user is writing a function
      if (finalStep.test(value)) { // If the regex matches
        this.functionTooltipStep[key] = 3
        if (this.editCell === key) this.isWritingFunction = false // The user finished writing a function
        return true
      }
      const thirdStep = /=\(\d+-\d+\)[+-]\(?(\d+)?-?(\d+)?$/ // Regex for the third step =(x-y)± with the following as optional (x-y
      if (thirdStep.test(value)) { // If the regex matches
        this.functionTooltipStep[key] = 2
        return true
      }
      const secondStep = /=\(\d+-\d+\)$/ // Regex for the second step =(x-y)
      if (secondStep.test(value)) { // If the regex matches
        this.functionTooltipStep[key] = 1
        return true
      }
      const firstStep = /=(\((\d+)?-?(\d+)?$)|(=$)/ // Regex for the first step = with all the following as optional (x-y
      if (firstStep.test(value)) { // If the regex matches
        this.functionTooltipStep[key] = 0
        return true
      }
      if (this.editCell === key) this.isWritingFunction = false // The user is not writing a function
      if (value.startsWith('=') && value.length > 1) { // If the value starts with a "=" but it's more than that and none of the previous matched then is a wrong function
        this.functionError[key] = 'Unknown function'
      }
      delete this.functionTooltipStep[key] // Remove the function tooltips
      return false
    },
    validateFunction (func, key) { // Validates that the value is a function
      delete this.functionError[key] // Removes all errors
      const cellRegExp = /\(\d+-\d+\)/g // Regular expresion to match x and y inside the parentheses (x-y)
      let firstCell = null
      let secondCell = null
      try { // Try to asign the reje
        firstCell = cellRegExp.exec(func)[0].replace(/[()]/g, '') // Returns the first match
        secondCell = cellRegExp.exec(func)[0].replace(/[()]/g, '') // Returns the second match
      } catch (error) { // If exception then the user is still writing the function (we are probablu missing the secondCell)
        return
      }
      if (firstCell === key || secondCell === key) { // If one of the selected cells is the current one
        this.functionError[key] = "You should pick a cell that isn't the current one"
        return
      }
      const firstValue = this.getValue(firstCell)
      const secondValue = this.getValue(secondCell)

      if (firstValue.error || secondValue.error) { // If the value is an error
        this.functionError[key] = firstValue.error || secondValue.error
        return 0
      }
      return { firstValue, secondValue } // returns both values
    },
    calculateValue (func, key) { // Calculate function
      const validation = this.validateFunction(func, key) // First we validate the function
      if (this.functionError[key]) return func // If there's an error the result is the actual function
      delete this.functionError[key] // Remove errors

      let { secondValue, firstValue } = validation // Grab the values from the validation

      firstValue = parseInt(firstValue) || 0 // Set the value (if empty string it turns into 0)
      secondValue = parseInt(secondValue) || 0

      const operatorRegExp = /\).*\(/ // Grabs the operator inside the parentheses
      const operator = operatorRegExp.exec(func)[0]?.replace(/[()]/g, '') // Returns the operator
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
    min-width: 760px;
    box-shadow: var(--shadow);
    border: 1px solid #bbb;
  }
  td {
    border: .5px solid var(--separator);
    user-select: none;
    position: relative;
    height: 2.5rem;
    overflow: hidden;
    outline: 0;
    cursor: pointer;
    overflow: visible;
  }
  td.selected {
    border: 2px solid var(--primary);
    background-color: var(--separator);
    z-index: 2;
  }
  td.edit {
    cursor: text;
  }
</style>

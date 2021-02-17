<template>
    <table style="width:100%">
        <tr>
            <th v-for="(column, index) in sheetContent[0]" :key="index">{{ index }}</th>
        </tr>
        <tr v-for="(row, rowIndex) in sheetContent" :key="rowIndex">
            <td v-for="(cell, cellIndex) in row"
            :key="cellIndex"
            @click="selectCell(`${rowIndex}-${cellIndex}`)"
            @dblclick="selectForEditing"
            :class="{ selected: isSelected(`${rowIndex}-${cellIndex}`), edit: currentCell != null && currentCell == editCell}"

            >
                {{ cell }}
                <textarea
                :ref="`${rowIndex}-${cellIndex}`"
                v-model="currentValue"
                @keyup="setValue"
                @keydown.enter="unselectForEditing"
                @keydown.esc="unselectForEditing"
                rows="1"
                />
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
      currentValue: '',
      sheetContent: [
        ['0', '2', '', '5'],
        ['1', '', '', '5'],
        ['1', '', '6', '5']
      ]
    }
  },
  mounted: function () {
    addEventListener('keyup', (e) => {
      const controlKeys = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft']
      if (e.code === 'Space' && !this.editCell) this.selectForEditing()
      //   TODO: FIX THIS
      if (e.code === 'Backspace' && this.currentCell && !this.editCell) this.setValue(null, '')
      if (isFinite(e.key) && this.currentCell && !this.editCell) {
        this.setValue(null, e.key)
        this.selectForEditing()
      }
      if (controlKeys.indexOf(e.code) >= 0) {
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
      }
    })
  },
  methods: {
    selectCell: function (key) {
      this.currentCell = key
      if (this.editCell !== key) this.editCell = null
    },
    isSelected: function (key) {
      return this.currentCell === key
    },
    selectForEditing: function () {
      this.editCell = this.currentCell
      this.currentValue = this.getValue(this.currentCell)
      this.$refs[this.currentCell][0].focus()
    },
    getValue: function (key) {
      const row = key.split('-')[0]
      const col = key.split('-')[1]
      return this.sheetContent[row][col]
    },
    unselectForEditing: function (e) {
      e.preventDefault()
      this.editCell = null
      if (this.currentCell) this.$refs[this.currentCell][0].blur()
    },
    setValue: function (e = null, newVallue = null) {
      const newValue = newVallue ?? e.target?.value ?? '' // Optional chaining
      const row = this.currentCell.split('-')[0]
      const col = this.currentCell.split('-')[1]
      this.sheetContent[row][col] = newValue
      this.$forceUpdate()
    },
    moveTo: function (newPos) {
      const row = newPos.split('-')[0]
      const col = newPos.split('-')[1]
      if (row === '' || col === '') return
      if (row < 0 || col < 0) return
      if (this.sheetContent.length <= row || this.sheetContent[0].length <= col) return
      this.currentCell = newPos
    }
  }
}
</script>

<style>
    th, td {
        border: 2px solid #888888;
        user-select: none;
        position: relative;
    }
    td {
        cursor: pointer;
    }
    td textarea {
        opacity: 0;
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        resize: none;
        outline: none !important;
        border-radius: 0;
    }
    .selected {
        border-color: #439aff;
        background-color: #ebebeb;
    }
    td.selected.edit textarea {
        opacity: 1;
        pointer-events: inherit;
    }
</style>

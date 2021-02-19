<template>
  <div id="cellKey">
    <textarea
      rows="1"
      v-if="editCell == cellKey"
      :tabindex="-1"
      ref="textarea"
      :value="currentValue"
      @keyup="$emit('set-value', [$event])"
      @keydown.enter="$emit('unselect-for-editing', $event)"
      @keydown.esc="$emit('unselect-for-editing', $event)"
    />
    <spreadsheet-cell-context-menu
      v-if="options == cellKey"
      @select-for-editing="$emit('select-for-editing', $event)"
      @set-value="$emit('set-value', $event)" />
    <spreadsheet-cell-function-options-menu
      v-if="functionTooltips == cellKey"
      :tooltipStep="functionTooltipStep[cellKey]"
      :functionError="functionError[cellKey]"
      :getValue="getValue"
      @add-to-value="$emit('add-to-value', $event)"/>
  </div>
</template>

<script>
import SpreadsheetCellContextMenu from './SpreadsheetCellContextMenu.vue'
import SpreadsheetCellFunctionOptionsMenu from './SpreadsheetCellFunctionOptionsMenu.vue'
export default {
  components: { SpreadsheetCellContextMenu, SpreadsheetCellFunctionOptionsMenu },
  props: ['cellKey', 'editCell', 'options', 'functionTooltips', 'functionTooltipStep', 'functionError', 'currentValue'],
  methods: {
    getValue () {
      return this.$parent.getValue(this.cellKey)
    },
    test (param1, param2) {
      console.log({ param1, param2 })
    }
  }
}
</script>

<style>

</style>

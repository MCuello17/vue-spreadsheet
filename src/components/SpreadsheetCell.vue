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
    background: var(--background);
    color: var(--text);
  }
  .selected {
    border: 2px solid var(--primary);
    background-color: var(--separator);
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
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    padding: 10px 15px;
    border: 1px solid var(--separator-highlight);
    gap: 10px;
    background-color: var(--background);
    cursor: default;
    opacity: 1;
    z-index: 10;
  }
  .context-menu > button {
    bottom: calc(100% + 2.5rem);
    top: auto;
    cursor: pointer;
    outline: none;
    border: 1px solid var(--separator-highlight);
    padding: 5px 2px;
    background-color: var(--button);
    font-weight: bold;
    color: var(--text);
  }
  .context-menu button:hover {
    border: 1px solid var(--primary);
  }
  .context-menu small {
    font-weight: bold;
  }
  .context-menu > .error {
    color: var(--error);
  }
</style>

<template>
  <div
    class="context-menu function-options"
  >
    <small>Writing a function</small>
    <div v-if="tooltipStep == 0 && !functionError">
      Please select your first cell
    </div>
    <div v-if="tooltipStep == 1 && !functionError">
      Please choose a function
    </div>
    <button
      title="Add"
      tabindex="-1"
      @click="$emit('add-to-value', '+')"
      v-if="tooltipStep == 1 && !functionError">
      +
    </button>
    <button
      title="Substract"
      tabindex="-1"
      @click="$emit('add-to-value', '-')"
      v-if="tooltipStep == 1 && !functionError">
      -
    </button>
    <div v-if="tooltipStep == 2 && !functionError">
      Please select your last cell
    </div>
    <div v-if="tooltipStep == 3 && !functionError">
      result: <strong>{{ getValue() }}</strong>
    </div>
    <div
      v-if="functionError"
      class="error">
      {{ functionError }}
    </div>
  </div>
</template>

<script>
export default {
  props: ['tooltipStep', 'functionError', 'getValue']

}
</script>

<style>

</style>

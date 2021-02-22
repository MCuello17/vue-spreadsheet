# spreadsheet_challenge

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run dev
```

## How it works:
### Basic usage

 - You can use the arrow keys on your keyboard to select a cell or simply click on it.
 - Press spacebar or double click a cell to edit it.
 - You can also right click (or hold click on mobile) on a cell for quick actions.
 - Have fun!

### How functions work

Functions are formatted in the following way:

    =([row]-[column])±([row]-[column])
    
 1. All functions **must** start with an Equal sign (**=**).
 2. Following that you should click on the cell you want as first value (or you can write it's position as shown in the example above)
 3. Select an operator (**+** or **-**).
 4. And finally select the last cell in the same way you selected the first one.

## Todo:

 - Currently, the function tooltip appear below the current cell and that makes it imposible to select a cell if it's directly underneath the tooltips.

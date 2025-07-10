## 1. Write a basic slot machine game in javascript using pixi.js

Write a game in ECMAScript 6th edition (https://en.wikipedia.org/wiki/ECMAScript#ES2015) using pixi.js (https://pixijs.com/) that simulates a basic slot machine. The screen should display a 5 columns by 3 rows reels, a spin button below the reels and a text area below to display the wins. Elements should be centered in the screen and the game area containing the elements should rescale with window resizes. 

All images that will be used in the game should priorly be loaded in a preloader screen. The preloader screen should display the percentage of the assets that are loaded in a PIXI.Text, text should be centered in the screen. 

To display the symbols on the reels, use PIXI.Sprite with the symbol images provided.

For the spin button, use the circle button image provided. When pressing the spin button, the reels positions should be picked randomly and the symbols be updated on the screen. No spinning animation is required.

To determine the visible symbols, use this reelset bands description:

Reelset:
- Band 1: "hv2", "lv3", "lv3", "hv1", "hv1", "lv1", "hv1", "hv4", "lv1", "hv3", "hv2", "hv3", "lv4", "hv4", "lv1", "hv2", "lv4", "lv1", "lv3", "hv2"
- Band 2: "hv1", "lv2", "lv3", "lv2", "lv1", "lv1", "lv4", "lv1", "lv1", "hv4", "lv3", "hv2", "lv1", "lv3", "hv1", "lv1", "lv2", "lv4", "lv3", "lv2"
- Band 3: "lv1", "hv2", "lv3", "lv4", "hv3", "hv2", "lv2", "hv2", "hv2", "lv1", "hv3", "lv1", "hv1", "lv2", "hv3", "hv2", "hv4", "hv1", "lv2", "lv4"
- Band 4: "hv2", "lv2", "hv3", "lv2", "lv4", "lv4", "hv3", "lv2", "lv4", "hv1", "lv1", "hv1", "lv2", "hv3", "lv2", "lv3", "hv2", "lv1", "hv3", "lv2"
- Band 5: "lv3", "lv4", "hv2", "hv3", "hv4", "hv1", "hv3", "hv2", "hv2", "hv4", "hv4", "hv2", "lv2", "hv4", "hv1", "lv2", "hv1", "lv2", "hv4", "lv4"

The initial position of the reels should be:

    Positions: 0, 0, 0, 0, 0
    Screen:
      hv2 hv1 lv1 hv2 lv3
      lv3 lv2 hv2 lv2 lv4
      lv3 lv3 lv3 hv3 hv2

Here is an example of some positions and the symbols that should be displayed on the screen:

    Positions: 18, 9, 2, 0, 12
    Screen:
      lv3 hv4 lv3 hv2 lv2
      hv2 lv3 lv4 lv2 hv4
      hv2 hv2 hv3 hv3 hv1

## 2. Next, implement the winnings calculation for the following paytable:

     Symbol id | 3 of a kind | 4 of a kind | 5 of a kind 
    -----------|-------------|-------------|-------------
         hv1   |      10     |      20     |      50
    -----------|-------------|-------------|-------------
         hv2   |      5      |      10     |      20
    -----------|-------------|-------------|-------------
         hv3   |      5      |      10     |      15
    -----------|-------------|-------------|-------------
         hv4   |      5      |      10     |      15 
    -----------|-------------|-------------|-------------
         lv1   |      2      |      5      |      10 
    -----------|-------------|-------------|-------------
         lv2   |      1      |      2      |      5 
    -----------|-------------|-------------|-------------
         lv3   |      1      |      2      |      3 
    -----------|-------------|-------------|-------------
         lv4   |      1      |      2      |      3 
    -----------|-------------|-------------|-------------

The pay lines always pay from left to right, starting on the first, left-most column. You should check for winning combinations on the following lines (x represents a symbol match position on the pay line):

     Pay line id | visual description
    -------------|--------------------
                 |      - - - - -
          1      |      x x x x x
                 |      - - - - -
    -------------|--------------------
                 |      x x x x x
          2      |      - - - - -
                 |      - - - - -
    -------------|--------------------
                 |      - - - - -
          3      |      - - - - -
                 |      x x x x x
    -------------|--------------------
                 |      x x - - -
          4      |      - - x - -
                 |      - - - x x
    -------------|--------------------
                 |      - - - x x
          5      |      - - x - -
                 |      x x - - -
    -------------|-------------------- 
                 |      x - - - x
          6      |      - x - x -
                 |      - - x - -
    -------------|-------------------- 
                 |      - - x - -
          7      |      - x - x -
                 |      x - - - x

The winnings should be displayed in a multiline PIXI.Text. Winnings should first display the total wins then win details should be listed sequentially. Each entry should display the payline id, the symbol id, the number of symbols matching and the payout. The winnings text should be scaled to fit in the available viewport space below the spin button, it shouldn't overflow outside of the viewport.

Here is an example of a complete result with wins:

    Positions: 0, 11, 1, 10, 14
    Screen:
      hv2 hv2 hv2 lv1 hv1
      lv3 lv1 lv3 hv1 lv2
      lv3 lv3 lv4 lv2 hv1
    Total wins: 6 
    - payline 2, hv2 x3, 5
    - payline 5, lv3 x3, 1

And here's some other examples:

    Positions: 0, 0, 0, 0, 0
    Screen:
      hv2 hv1 lv1 hv2 lv3
      lv3 lv2 hv2 lv2 lv4
      lv3 lv3 lv3 hv3 hv2
    Total wins: 1 
    - payline 3, lv3 x3, 1

    Positions: 5, 14, 9, 9, 16
    Screen:
      lv1 hv1 lv1 hv1 hv1
      hv1 lv1 hv3 lv1 lv2
      hv4 lv2 lv1 hv1 hv4
    Total wins: 7
    - payline 6, lv1 x4, 5
    - payline 7, lv1 x3, 2

    Positions: 1, 16, 2, 15, 0
    Screen:
      lv3 lv2 lv3 lv3 lv3
      lv3 lv4 lv4 hv2 lv4
      hv1 lv3 hv3 lv1 hv2
    Total wins: 0

    Positions: 18, 9, 2, 0, 12
    Screen:
      lv3 hv4 lv3 hv2 lv2
      hv2 lv3 lv4 lv2 hv4
      hv2 hv2 hv3 hv3 hv1
    Total wins: 0

## Assignment evaluation

Your submission will be evaluated around 4 criterions. Each will be assigned a score over 5, for a maxium score of 20:

- Correctness gives a score based on correctness of the results and absence of errors, if the submission does what the assignment asked for.

- Readability & Style gives a score based on if the code is readable and well organized, follows best-practices and conventions.

- Robustness & Efficiency gives a score based on if the code includes tests, is robust and cater for edge cases or simple updates of the math model.

- General gives a score based on general presentation of the submission, whether a readme file is provided, commits have descriptive comments, and other more general topics.
/**
 * This class serves as a super class for "User" and "Contact".
 */
export class Person {
    name: string;
    color: string;


    /**
     * Create person object from name. In doing so, generate a random color for the person's badge.
     * @param name name of personn
     */
    constructor(name: string) {
        this.name = name;
        this.color = this.getRandomColor();
    }


    /**
     * Randomly select color from USER_COLORS (see below) 
     * @returns color (hexadecimal string)
     */
    getRandomColor(): string {
        return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
    }
}

const USER_COLORS: string[] = [
    '#FDDC2F',
    '#33DA81',
    '#E98366',
    '#C27177',
    '#42F9B9',
    '#2AEC8B',
    '#6DD44A',
    '#C7ACC0',
    '#309CF4',
    '#B663F3',
    '#b579d2',
    '#809283',
    '#58AC47',
    '#2FB287',
    '#2AFDC3',
    '#D2FA60',
    '#A8EE51',
    '#A9DDC7',
    '#FE68C4',
    '#DC3DF5',
    '#05CDD7',
    '#E07D47',
    '#8EA906',
    '#36B3F0',
    '#BF59F2'
];

/* 
 * Chromosome representation:
 * 
 */

var chance = new Chance(Math.random);
var BOX;

/* 
 * Class representing a box with items as an individual in the
 * genetic algorithm.
 * 
 */
class Box {
    constructor(items) {
        this.chromosome = items;
        this.weight = Box.getWeight(items);
        this.value = Box.getValue(items);
    }

    crossover(other) {
        var x1, x2;

        // Varies a little in the left and right part of the chromosome splitting,
        // meaning that the left part does not always belong to this object
        if (chance.integer({ min: 0, max: 1 })) {
            x1 = this.chromosome;
            x2 = other.chromosome;
        } else {
            x1 = other.chromosome;
            x2 = this.chromosome;
        }

        var index = chance.integer({ min: 1, max: this.chromosome.length - 2 });
        var items = x1.slice(0, index).concat(x2.slice(index));

        return new Box(items);
    }

    /* 
     * Mutation removing one item and adding another.
     */
    mutate(genes = 1) {
        var index;
        var notFound = true;

        // Find a slot with at least one item
        while (notFound) {
            index = chance.integer({ min: 0, max: this.chromosome.length - 1 });

            if (this.chromosome[index]) {
                --this.chromosome[index];
                notFound = false;
            }
        }

        // Find a slot with no items
        notFound = true;
        while (notFound) {
            index = chance.integer({ min: 0, max: this.chromosome.length - 1 });

            if (!this.chromosome[index]) {
                ++this.chromosome[index];
                notFound = false;
            }
        }
    }

    static getWeight(items) {
        var weight = 0;

        for (var i = 0; i < items.length; ++i) {
            weight += BOX[i].weight * items[i];
        }
        return weight;
    }

    static getValue(items) {
        var weight = 0;

        for (var i = 0; i < items.length; ++i) {
            weight += BOX[i].value * items[i];
        }
        return weight;
    }
}

/* 
 * Generator class that creates a population 
 */
class BoxGenerator {
    constructor(type) {

        // TODO: Might wanna find a way to reuse code on all constraints
        if (type != "normal") {
            if (type === "existence") {
                console.log("Population generator for genetic search with existence verification.");

                this.generate = function randomPopulation(population, popSize, chromSize, info) {
                    var picked;
                    var chromosome;
                    var count;
                    var index;
                    var selecting;

                    var items;
                    for (var i = 0; i < popSize; ++i) {
                        items = chance.integer({ min: 1, max: 3 });
                        picked = new Set();
                        chromosome = new Array(chromSize).fill(0);
                        count = 0;

                        // Iterate a from 1 to 3 times max
                        for (var j = 0; j < items; ++j) {
                            selecting = true;
                            while (selecting) {

                                index = chance.integer({ min: 0, max: (chromSize - 1) });

                                // Won't modify the index if it has already been chosen
                                if (!picked.has(index) && chromosome[index] <= info) {
                                    selecting = false;

                                    

                                    picked.add(index);
                                }
                            }

                            chromosome[index] = 1;
                        }

                        var box = new Box(chromosome);
                        population.push(box);
                    }
                }
            } else {
                console.log("Population generator for genetic search with type verification.");

                this.generate = function () {

                }
            }
        }
        else {
            console.log("Population generator for normal genetic search.");

            this.generate = function randomPopulation(population, popSize, chromSize) {
                var picked;
                var chromosome;
                var count;
                var index;
                var selecting;

                var items;
                for (var i = 0; i < popSize; ++i) {
                    items = chance.integer({ min: 1, max: 3 });
                    picked = new Set();
                    chromosome = new Array(chromSize).fill(0);
                    count = 0;

                    // Iterate a from 1 to 3 times max
                    for (var j = 0; j < items; ++j) {
                        selecting = true;
                        while (selecting) {

                            index = chance.integer({ min: 0, max: (chromSize - 1) });

                            if (!picked.has(index)) {
                                selecting = false;
                                picked.add(index);
                            }
                        }

                        chromosome[index] = 1;
                    }

                    var box = new Box(chromosome);
                    population.push(box);
                }
            }
        }
    }
}

/*
 * Utility class that aids in the selection of individuals in a population
 * according to a fitness function.
 */
class Roulette {
    constructor(roulette) {
        this.roulette = roulette;
    }

    select(prob) {
        var index = this.roulette.length - 1;
        for (var r = 0; r < index; ++r) {
            if (this.roulette[r] <= prob && prob < this.roulette[r + 1]) {
                return r;
            }
        }
    }
}

/* 
 * Normal genetic search, without considering existence nor type
 */
function geneticSearch(box, maxw, numGen, popSize, selection, searchType) {
    console.log("Genetic algorithm", (selection != "normal" ? "with " + searchType : ""),
        "for maximization of elements in a box.");
    console.log("Max weight:", maxw, "\nGenerations", numGen,
        "\nPopulation", popSize, "\nIndividuals that will reproduce:", selection);

    BOX = box;
    var population = [];
    var popGenerator = new BoxGenerator(searchType);

    for (var i = 1; i <= numGen; ++i) {
        // Repopulate
        popGenerator.generate(population, popSize - population.length, box.length, searchType);

        // Select the unfit
        var unfit = [];
        var sum = 0;
        for (var j = 0; j < population.length; ++j) {
            if (population[j].weight > maxw) {
                unfit.splice(0, 0, j);
            }
            else {
                sum += population[j].value;
            }
        }

        // Remove the unfit
        for (u of unfit) {
            population.splice(u, 1);
        }

        // The selection of individuals is done with a roulette.
        var distribution = [0];
        for (var p = 0; p < population.length; ++p) {
            population[p].fitness = population[p].value / sum;
            distribution.push(population[p].fitness + distribution[distribution.length - 1]);
        }

        // Make sure that individuals still exist in the population
        if (population.length > 2) {
            // Reproduction
            var roulette = new Roulette(distribution);
            var parents;
            var probability;
            var index;
            var offspring;
            for (var s = 0; s < selection; ++s) {

                parents = [roulette.select(chance.random()), roulette.select(chance.random())];

                // 40% chance of crossover. If fails, one of the parents will be cloned
                if (chance.random() <= .4) {
                    offspring = population[parents[0]].crossover(population[parents[1]]);
                } else {
                    if (chance.integer({ min: 0, max: 1 })) {
                        offspring = new Box(population[parents[1]].chromosome);
                    } else {
                        offspring = new Box(population[parents[0]].chromosome);
                    }
                }

                offspring.mutate();
                population.push(offspring);
            }
        }

        population.sort(compare);
        console.log("Generation #", i);
        for (p of population) {
            console.log("\t", p);

        }

        // Kill the least 2 fit individuals
        if (population.length > (popSize / 2)) {
            population.splice(popSize - 2);
        }
    }
}

function randomPopulation(population, popSize, chromSize, searchType) {
    var picked;
    var chromosome;
    var count;
    var index;
    var selecting;

    var items;
    for (var i = 0; i < popSize; ++i) {
        items = chance.integer({ min: 1, max: 3 });
        picked = new Set();
        chromosome = new Array(chromSize).fill(0);
        count = 0;

        // Iterate a from 1 to 3 times max
        for (var j = 0; j < items; ++j) {
            selecting = true;
            while (selecting) {

                index = chance.integer({ min: 0, max: (chromSize - 1) });

                if (!picked.has(index)) {
                    selecting = false;
                    picked.add(index);
                }
            }

            chromosome[index] = 1;
        }

        var box = new Box(chromosome);
        population.push(box);
    }
}

/* 
 * Comparison function for the sort method of an array of Box objects
 */
function compare(a, b) {
    if (a.value > b.value) {
        return -1;
    }
    else if (a.value < b.value) {
        return 1;
    }

    // Up until this point, since both boxes have equal worth, the one
    // with the least weight is the optimal one
    if (a.weight > b.weight) {
        return -1;
    }
    else if (a.weight < b.weight) {
        return 1;
    }

    return 0;
}
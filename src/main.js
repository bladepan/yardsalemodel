class Agent {
    constructor(name, wealth) {
        this.name = name;
        this.wealth = wealth;
    }

    trade(agent, rewardRate, penaltyRate) {
        let richPerson = this;
        let poorPerson = agent;
        if (this.wealth < agent.wealth) {
            richPerson = agent;
            poorPerson = this;
        }

        const rand = Math.random();
        const poorWin = rand < 0.5;

        if (poorWin) {
            const delta = poorPerson.wealth * rewardRate;
            richPerson.transferWealth(poorPerson, delta);
        } else {
            const delta = poorPerson.wealth * penaltyRate;
            poorPerson.transferWealth(richPerson, delta);
        }
    }

    transferWealth(agent, delta) {
        this.decreaseWealth(delta);
        agent.increaseWealth(delta);
    }

    increaseWealth(delta) {
        this.wealth += delta;
    }

    decreaseWealth(delta) {
        this.wealth -= delta;
    }
}

class SocietyReportData {
    constructor() {
        this.time = 0;
        this.richest = null;
        this.poorest = null;
        this.medium = null;
        this.top = [];
        this.bottom = [];
    }
}

class Society {
    constructor(agentCount, initialWealth, rewardRate, penaltyRate) {
        this.agentCount = agentCount;
        this.agents = [];
        for (let i = 0; i < agentCount; i++) {
            this.agents.push(new Agent(`agent${i}`, initialWealth));
        }
        this.sortedAgents = this.agents.map(i => i);
        this.rewardRate = rewardRate;
        this.penaltyRate = penaltyRate;
        this.time = 0;
    }

    trade() {
        let index1 = 0;
        let index2 = 0;
        while (index1 === index2) {
            index1 = parseInt(Math.random() * this.agentCount);
            index2 = parseInt(Math.random() * this.agentCount);
        }
        this.agents[index1].trade(this.agents[index2], this.rewardRate, this.penaltyRate);
        this.time++;
    }

    sortAgents() {
        this.sortedAgents.sort((a, b) => {
            const delta = a.wealth - b.wealth;
            if (delta === 0) {
                return 0;
            }

            return delta > 0 ? 1 : -1;
        });
    }

    report() {
        const data = new SocietyReportData();
        data.time = this.time;
        data.poorest = this.sortedAgents[0];
        data.richest = this.sortedAgents[this.agentCount - 1];

        const count = 10;
        for (let i = 0; i < count; i++) {
            const agent = this.sortedAgents[i];
            data.top.push(agent);
        }

        const mediumAgent = this.sortedAgents[parseInt(this.agentCount/2)];
        data.medium = mediumAgent;

        for (let i = this.agentCount - 1; i >= this.agentCount - count; i--) {
            const agent = this.sortedAgents[i];
            data.bottom.push(agent);
        }

        return data;
    }
}

// const society = new Society(1000, 1000, 0.2, 0.17);

// for (let i = 0; i < 1000000; i++) {
//     society.trade();
//     if (i % 1000 === 0) {
//         society.sortAgents();
//         console.log(i);
//         society.report();
//     }
// }

class SimulationParams {
    constructor() {
        this.initialWealth = 1000;
        this.rewardRate = 0.2;
        this.penaltyRate = 0.17;
        this.agentCount = 1000;
    }
}

class UiInput {
    constructor(id) {
        this.ele = document.getElementById(id);
    }

    getIntValue() {
        return parseInt(this.ele.value);
    }

    getFloatValue() {
        return parseFloat(this.ele.value);
    }

    setValue(val) {
        this.ele.value = val;
    }
}

class LogObj {
    constructor(text) {
        this.time = new Date();
        this.text = text;
    }
}

class UiLogger {
    constructor(id) {
        this.ele = document.getElementById(id);
        this.msgs = [];
    }

    log(msg) {
        let logObj = new LogObj(msg);
        this.msgs.push(logObj);
        if (this.msgs.length > 1000) {
            this.msgs = this.msgs.splice(0, 500);
            this.ele.innerHTML = '';

            for (let i = this.msgs.length - 1; i >= 0; i--) {
                const newEle = this.newChildEle(logObj);
                this.ele.appendChild(newEle);
            }
        } else {
            const newEle = this.newChildEle(logObj);
            if(this.ele.firstChild) {
                this.ele.insertBefore(newEle, this.ele.firstChild)
            } else {
                this.ele.appendChild(newEle);
            }
        }
    }

    newChildEle(logObj) {
        const newEle = document.createElement('div');
        newEle.innerText = `${logObj.time}`;

        const codeEle = document.createElement('code');
        codeEle.innerText = logObj.text;
        newEle.appendChild(codeEle);
        return newEle;
    }
}

class UiController {
    constructor() {
        this.agentCountInput = new UiInput('agentCountInput');
        this.initialWealthInput = new UiInput('initialWealthInput');
        this.rewardRateInput = new UiInput('rewardRateInput');
        this.penaltyRateInput = new UiInput('penaltyRateInput');
        this.roundsInput = new UiInput('roundsInput');
        this.logger = new UiLogger('logOutput');
        this.reset();
    }

    getInputData() {
        const data = new SimulationParams();
        data.agentCount = this.agentCountInput.getIntValue();
        data.initialWealth = this.initialWealthInput.getIntValue();
        data.rewardRate = this.rewardRateInput.getFloatValue();
        data.penaltyRate = this.penaltyRateInput.getFloatValue();
        return data;
    }

    runSimulation() {
        if (!this.society) {
            const data = this.getInputData();
            this.society = new Society(data.agentCount, data.initialWealth, data.rewardRate, data.penaltyRate);
            this.printSimulationParamsOutput(data);
        }
        const rounds = this.roundsInput.getIntValue();
        this.logger.log(`Run simulation for ${rounds} rounds.`);
        let logStep = parseInt(rounds / 100);
        if (logStep === 0) {
            logStep = 1;
        }
        for (let i = 0; i < rounds; i++) {
            this.society.trade();
            if (i === 0 || i % logStep === 0) {
                // log progress
                this.logSimulationProgress();
            }
        }

        this.logSimulationProgress();
    }

    logSimulationProgress() {
        this.society.sortAgents();
        const data = this.society.report();
        this.logger.log(JSON.stringify(data, 2));
    }

    printSimulationParamsOutput(data) {
        document.getElementById('simulationParamsOutput').innerText = JSON.stringify(data);
    }

    reset() {
        this.society = null;
        const data = new SimulationParams();
        this.agentCountInput.setValue(data.agentCount);
        this.initialWealthInput.setValue(data.initialWealth);
        this.rewardRateInput.setValue(data.rewardRate);
        this.penaltyRateInput.setValue(data.penaltyRate);
        this.roundsInput.setValue(1000000);
        this.printSimulationParamsOutput(data);
    }
}

const controller = new UiController();

function runSimulation() {
    controller.runSimulation();
}

function resetSimulation() {
    controller.reset();
}


// set the dimensions and margins of the graph
var width = 450
height = 450
margin = 40

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
var radius = Math.min(width, height) / 2 - margin

// append the svg object to the div called 'my_dataviz'
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Create dummy data
var data = { a: 9, b: 20, c: 30, d: 8, e: 12 }

// set the color scale
var color = d3.scaleOrdinal()
    .domain(data)
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"])

// Compute the position of each group on the pie:
var pie = d3.pie()
    .value(function (d) { return d.value; })
var data_ready = pie(d3.entries(data))

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg
    .selectAll('whatever')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', d3.arc()
        .innerRadius(0)
        .outerRadius(radius)
    )
    .attr('fill', function (d) { return (color(d.data.key)) })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)
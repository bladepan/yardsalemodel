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
            if (this.ele.firstChild) {
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
        this.pieChartController = new PieChartVisController('piechartVis', 'Top 10 richest people wealth');
        this.barChartController = new BarChartController('barchartVis', 'Wealth comparison');
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

        const result = this.logSimulationProgress();
        this.renderCharts(result);
    }

    renderCharts(reportData) {
        let topStats = new AgentStats(reportData.top);
        
        const othersWealth = this.society.totoalWealth - topStats.sum;

        this.pieChartController.setData([{
            title: `top ${reportData.top.length} wealthiest people`,
            val: topStats.sum
        }, {
            title: `other ${this.society.agentCount - reportData.top.length} people`,
            val: othersWealth
        }]);

        const bottomStats = new AgentStats(reportData.bottom);
        this.barChartController.setData([
            {title: 'wealthiest', val: reportData.max.wealth},
            {title: `top ${reportData.top.length} average`, val: topStats.avg},
            {title: 'medium', val: reportData.medium.wealth},
            {title: `bottom ${reportData.bottom.length} average`, val: bottomStats.avg},
            {title: 'poorest', val: reportData.min.wealth}
        ]);
    }

    logSimulationProgress() {
        this.society.sortAgents();
        const data = this.society.report();
        this.logger.log(JSON.stringify(data, 2));
        return data;
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
        this.roundsInput.setValue(10000);
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

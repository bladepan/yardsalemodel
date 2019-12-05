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
      this.totoalWealth = initialWealth * agentCount;
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
      data.min = this.sortedAgents[0];
      data.max = this.sortedAgents[this.agentCount - 1];

      const count = 10;
      for (let i = 0; i < count; i++) {
          const agent = this.sortedAgents[i];
          data.bottom.push(agent);
      }

      const mediumAgent = this.sortedAgents[parseInt(this.agentCount / 2)];
      data.medium = mediumAgent;

      for (let i = this.agentCount - 1; i >= this.agentCount - count; i--) {
          const agent = this.sortedAgents[i];
          data.top.push(agent);
      }

      return data;
  }
}

class AgentStats {
  constructor(vals) {
      this.vals = vals;
      this.count = vals.length;
      let sum = 0;
      vals.forEach(i => {
          sum += i.wealth;
      });
      this.sum = sum;
      this.avg = sum/this.count;
  }
}
type WorkflowStep<T extends Object> = (
  state: Partial<T>
) => Promise<Partial<T>> | Partial<T>;

export class Workflow<T extends Object> {
  constructor(private steps: WorkflowStep<T>[], private state: Partial<T>) {}

  async run() {
    while (this.steps.length > 0) {
      let curr = this.steps.shift()!;
      this.state = await curr(this.state);
    }

    return this.state;
  }
}

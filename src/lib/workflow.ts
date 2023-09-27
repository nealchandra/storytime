export type WorkflowStep<T extends Object> = (
  state: Partial<T>
) => Promise<Partial<T>> | Partial<T>;

export class Workflow<T extends Object> {
  constructor(
    private steps: WorkflowStep<T>[],
    private state: Partial<T>,
    private save_fn?: (state: Partial<T>) => void
  ) {}

  async init() {
    await this.save_fn?.(this.state);
  }

  async run() {
    while (this.steps.length > 0) {
      let curr = this.steps.shift()!;
      this.state = await curr(this.state);

      await this.save_fn?.(this.state);
    }

    return this.state;
  }
}

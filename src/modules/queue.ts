class Queue {
  // eslint-disable-next-line functional/prefer-readonly-type
  private rootResolve: Promise<void> = Promise.resolve();

  async run(callback: { (): Promise<void> }): Promise<void> {
    const nextResolve = this.rootResolve
      .then(async () => {
        await callback();
      })
      .catch(async (err) => {
        console.warn(err);
        await callback();
      });

    this.rootResolve = nextResolve;
    await nextResolve;
  }
}

export default Queue;

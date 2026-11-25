export class QueueNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

export class Queue {
  #head = null;
  #tail = null;
  #size = 0;

  enqueue(value) {
    const node = new QueueNode(value);

    if (this.#size === 0) {
      this.#head = node;
      this.#tail = node;
    } else {
      this.#tail.next = node;
      this.#tail = node;
    }

    this.#size += 1;
  }

  dequeue() {
    if (this.#size === 0) {
      return undefined;
    }

    const value = this.#head.value;

    this.#head = this.#head.next;
    this.#size -= 1;

    if (this.#size === 0) {
      this.#tail = null;
    }

    return value;
  }

  peek() {
    return this.#head?.value;
  }

  size() {
    return this.#size;
  }
}
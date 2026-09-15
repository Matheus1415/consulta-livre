class AppLocalStorage {
  private prefix: string;

  constructor(prefix: string = "consultaLivre") {
    this.prefix = prefix;
  }

  private makeKey(key: string) {
    return `${this.prefix}:${key}`;
  }

  set(key: string, value: string, isObject: boolean = false): void {
    let val = value;

    if (isObject) {
      val = JSON.stringify(value);
    }

    localStorage.setItem(this.makeKey(key), btoa(val));
  }

  get(key: string, isObject: boolean = false): string | null {
    const stored = localStorage.getItem(this.makeKey(key));
    if (!stored) return null;

    try {
      let val: any = atob(stored);

      if (isObject) {
        return JSON.parse(val);
      }

      return val;
    } catch {
      return null;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.makeKey(key));
  }

  has(key: string): boolean {
    return localStorage.getItem(this.makeKey(key)) !== null;
  }
}

const LocalStorageWrapper = new AppLocalStorage();

export { LocalStorageWrapper };

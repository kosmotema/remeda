import { filter } from "./filter";
import { flat } from "./flat";
import { flatMap } from "./flatMap";
import { identity } from "./identity";
import { map } from "./map";
import { pipe } from "./pipe";
import { prop } from "./prop";
import { take } from "./take";

it("should pipe a single operation", () => {
  const result = pipe(1, (x) => x * 2);
  expect(result).toEqual(2);
});

it("should pipe operations", () => {
  const result = pipe(
    1,
    (x) => x * 2,
    (x) => x * 3,
  );
  expect(result).toEqual(6);
});

describe("lazy", () => {
  it("lazy map + take", () => {
    const count = vi.fn();
    const result = pipe(
      [1, 2, 3],
      map((x) => {
        count();
        return x * 10;
      }),
      take(2),
    );
    expect(count).toHaveBeenCalledTimes(2);
    expect(result).toEqual([10, 20]);
  });

  it("lazy map + filter + take", () => {
    const count = vi.fn();
    const result = pipe(
      [1, 2, 3, 4, 5],
      map((x) => {
        count();
        return x * 10;
      }),
      filter((x) => (x / 10) % 2 === 1),
      take(2),
    );
    expect(count).toHaveBeenCalledTimes(3);
    expect(result).toEqual([10, 30]);
  });

  it("lazy after 1st op", () => {
    const count = vi.fn();
    const result = pipe(
      { inner: [1, 2, 3] },
      prop("inner"),
      map((x) => {
        count();
        return x * 10;
      }),
      take(2),
    );
    expect(count).toHaveBeenCalledTimes(2);
    expect(result).toEqual([10, 20]);
  });

  it("break lazy", () => {
    const count = vi.fn();
    const result = pipe(
      [1, 2, 3],
      map((x) => {
        count();
        return x * 10;
      }),
      (x) => x,
      take(2),
    );
    expect(count).toHaveBeenCalledTimes(3);
    expect(result).toEqual([10, 20]);
  });

  it("multiple take", () => {
    const count = vi.fn();
    const result = pipe(
      [1, 2, 3],
      map((x) => {
        count();
        return x * 10;
      }),
      take(2),
      take(1),
    );
    expect(count).toHaveBeenCalledTimes(1);
    expect(result).toEqual([10]);
  });

  it("multiple lazy", () => {
    const count = vi.fn();
    const count2 = vi.fn();
    const result = pipe(
      [1, 2, 3, 4, 5, 6, 7],
      map((x) => {
        count();
        return x * 10;
      }),
      take(4),
      identity(),
      map((x) => {
        count2();
        return x * 10;
      }),
      take(2),
    );
    expect(count).toHaveBeenCalledTimes(4);
    expect(count2).toHaveBeenCalledTimes(2);
    expect(result).toEqual([100, 200]);
  });

  it("lazy take + flat", () => {
    const result = pipe(
      [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
      take(1),
      flat(),
    );
    expect(result).toEqual([1, 2]);
  });

  it("lazy take + flatMap", () => {
    const result = pipe(
      [
        [
          [1, 2],
          [2, 3],
        ],
        [
          [4, 5],
          [5, 6],
        ],
        [
          [7, 8],
          [8, 9],
        ],
      ],
      take(2),
      flatMap((x) => x[1]),
    );
    expect(result).toEqual([2, 3, 5, 6]);
  });
});

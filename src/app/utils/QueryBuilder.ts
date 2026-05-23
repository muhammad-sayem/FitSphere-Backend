/* eslint-disable no-useless-assignment */
export type QueryParams = {
  searchTerm?: string | string[];
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  fields?: string;
  [key: string]: unknown;
};

type SortOrder = "asc" | "desc";
type FilterOperator = "lt" | "lte" | "gt" | "gte" | "equals" | "in" | "not";

const filterOperatorPattern = /^([^[\]]+)\[([^[\]]+)\]$/;

const isListRelationSegment = (segment: string) => segment.endsWith("s") || segment.endsWith("ies");

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const mergeDeep = (target: Record<string, unknown>, source: Record<string, unknown>) => {
  Object.entries(source).forEach(([key, value]) => {
    const existingValue = target[key];

    if (isPlainObject(existingValue) && isPlainObject(value)) {
      target[key] = mergeDeep({ ...existingValue }, value);
      return;
    }

    target[key] = value;
  });

  return target;
};

const buildNestedFieldFilter = (fieldPath: string, leafFilter: unknown) => {
  const segments = fieldPath.split(".");

  if (segments.length === 1) {
    return leafFilter;
  }

  let nestedFilter: Record<string, unknown> = {
    [segments[segments.length - 1]]: leafFilter,
  };

  for (let index = segments.length - 2; index >= 0; index -= 1) {
    const segment = segments[index];

    nestedFilter = {
      [segment]: isListRelationSegment(segment)
        ? {
          some: nestedFilter,
        }
        : nestedFilter,
    };
  }

  return nestedFilter;
};

const isNestedFieldPath = (fieldPath: string) => fieldPath.includes(".");

const normalizeFilterValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => parseQueryValue(item));
  }

  return parseQueryValue(value);
};

const toNumberIfNumeric = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (trimmed === "") {
    return value;
  }

  const numericValue = Number(trimmed);

  return Number.isNaN(numericValue) ? value : numericValue;
};

const buildOperatorFilter = (operator: FilterOperator, value: unknown) => {
  const normalizedValue = normalizeFilterValue(value);

  if (operator === "in") {
    return {
      in: Array.isArray(normalizedValue) ? normalizedValue : [normalizedValue],
    };
  }

  if (operator === "not") {
    return {
      not: normalizedValue,
    };
  }

  return {
    [operator]: toNumberIfNumeric(normalizedValue),
  };
};

//* For handlign boolean (true / false) *//
const parseQueryValue = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return value;
};

const getPaginationOptions = (query: QueryParams) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

const getSortOptions = (query: QueryParams) => {
  const sortBy = (query.sortBy as string) || "createdAt";
  const sortOrder: SortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  let orderBy: Record<string, unknown> = {};

  if (sortBy.includes(".")) {
    const [relation, field] = sortBy.split(".");
    const normalizedRelation = relation === "tutor" ? "trainer" : relation;

    orderBy = {
      [normalizedRelation]: {
        [field]: sortOrder,
      },
    };
  } else {
    orderBy = {
      [sortBy]: sortOrder,
    };
  }

  return { orderBy };
};

const getSearchConditions = <TWhereInput>(query: QueryParams, searchableFields: string[]) => {
  const searchConditions: TWhereInput[] = [];

  if (query.searchTerm) {
    const searchTerms = Array.isArray(query.searchTerm) ? query.searchTerm : [query.searchTerm];

    searchTerms
      .map((term) => (typeof term === "string" ? term.trim() : ""))
      .filter(Boolean)
      .forEach((searchTerm) => {
        searchableFields.forEach((field) => {
          const leafFilter = {
            contains: searchTerm,
            mode: "insensitive",
          };

          if (isNestedFieldPath(field)) {
            // convert 'user.name' into { user: { name: { contains: ... } } }
            searchConditions.push(buildNestedFieldFilter(field, leafFilter) as TWhereInput);
          } else {
            searchConditions.push(
              {
                [field]: leafFilter,
              } as TWhereInput
            );
          }
        });
      });
  }

  return { searchConditions };
};

const getFilterConditions = (query: QueryParams, filterableFields: string[]) => {
  const filterConditions: Record<string, unknown> = {};

  filterableFields.forEach((field) => {
    const directValue = query[field];

    if (directValue !== undefined) {
      if (!isNestedFieldPath(field)) {
        if (Array.isArray(directValue)) {
          filterConditions[field] = {
            in: directValue.map((item) => parseQueryValue(item)),
          };

          return;
        }

        filterConditions[field] = toNumberIfNumeric(parseQueryValue(directValue));
        return;
      }

      if (Array.isArray(directValue)) {
        mergeDeep(filterConditions, buildNestedFieldFilter(field, {
          in: directValue.map((item) => toNumberIfNumeric(parseQueryValue(item))),
        }) as Record<string, unknown>);

        return;
      }

      if (typeof directValue === "object" && directValue !== null) {
        mergeDeep(filterConditions, buildNestedFieldFilter(field, directValue) as Record<string, unknown>);
        return;
      }

      mergeDeep(filterConditions, buildNestedFieldFilter(field, toNumberIfNumeric(parseQueryValue(directValue))) as Record<string, unknown>);
      return;
    }

    const operatorEntries = Object.entries(query).filter(([key]) => filterOperatorPattern.test(key));

    if (operatorEntries.length === 0) {
      return;
    }

    operatorEntries.forEach(([key, value]) => {
      const match = key.match(filterOperatorPattern);

      if (!match || match[1] !== field) {
        return;
      }

      const operator = match[2] as FilterOperator;

      const operatorFilter = {
        ...(filterConditions[field] as Record<string, unknown> | undefined),
        ...buildOperatorFilter(operator, value),
      };

      if (isNestedFieldPath(field)) {
        mergeDeep(filterConditions, buildNestedFieldFilter(field, operatorFilter) as Record<string, unknown>);
        return;
      }

      filterConditions[field] = operatorFilter;
    });
  });

  return { filterConditions };
};

export const QueryBuilder = {
  getPaginationOptions,
  getSortOptions,
  getSearchConditions,
  getFilterConditions,
};
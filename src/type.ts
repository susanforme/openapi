export type OpenAPIJSONSchema = {
  swagger: string;
  info: {
    description: string;
    version: string;
    title: string;
    contact: {
      name: string;
    };
  };
  tags: {
    name: string;
    description: string;
  }[];
  definitions: {
    [key: string]: {
      type: OpenAPIJSONSchemaType;
      description: string;
      title: string;
      properties: {
        [key: string]: {
          type: OpenAPIJSONSchemaType;
          description?: string;
          example?: string;
          items?: OpenAPIJSON$Ref;
        };
      };
    };
  };
  paths: {
    [key: string]: {
      [key in OpenAPIMethod]: {
        tags: string[];
        summary: string;
        operationId: string;
        consumes: string[];
        produces: string[];
        parameters: {
          name: string;
          in: OpenAPIRequestType;
          description: string;
          required: boolean;
          schema: OpenAPIJSON$Ref;
        }[];
      };
    };
  };
};
export enum OpenAPIJSONSchemaType {
  string = 'string',
  integer = 'number',
  array = 'array',
  object = 'object',
}

export type OpenAPIJSON$Ref = {
  $ref: string;
  originalRef: string;
};

export type OpenAPIMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'delete';

export type OpenAPIRequestType =
  | 'query'
  | 'body'
  | 'path'
  | 'formData';
export type Options = {
  /** 支持json字符串,绝对路径,网络路径 不支持相对路径 */
  input: string;
  /** 输出路径 */
  output: string;
  modelsDirectoryName?: string;
  apiDirectoryName?: string;
  /** n个个数分为一片执行任务,大任务分小片,小人物设置高容量,因为可能创建worker的消耗大于同步消耗 */
  workerCapacity?: number;
  /** 路径分割的层级 */
  pathSplitLevel?: number;
  /** 一级路由相同 */
  sameRootLevel?: boolean;
};

export type OpenAPIServicesType = {
  [key: string]: OpenAPIJSONSchema['paths'];
};
export type OpenAPIModelType =
  OpenAPIJSONSchema['definitions'];

# 从openapi生成类型及代码

# 设计

1. 支持多model传入,根据一级区分

## 目录结构

```bash
├── models / labms
├── package.json
├── src
```

### models

```ts
export namespace LabmsModel{
    
}
```



## Todo

- [ ] 支持传入函数及json字符串
- [ ] 生成代码
- [ ] 生成类型
- [ ] 生成文档
- [ ] 生成测试
- [ ] 生成mock
- [ ] 生成mock测试
- [ ] 生成mock文档
- [ ] 生成mock代码
- [ ] 生成mock类型
- [ ] 读取prettier配置,生成符合prettier的代码
- [ ] 读取tsconfig配置,生成符合tsconfig的代码

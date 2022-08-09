import * as ast from 'ts-morph'
import * as RA from '../src/ReadonlyArray'
import { pipe } from '../src/function'
import * as glob from 'glob'
import * as path from 'path'
import * as O from '../src/Option'
import * as M from '../src/Monoid'
import * as string from '../src/string'

// -------------------------------------------------------------------------------------
// domain
// -------------------------------------------------------------------------------------

export interface Overloadings {
  readonly _tag: 'Overloadings'
  readonly signatures: ReadonlyArray<Type>
}

export interface TypeParameter {
  readonly name: string
  readonly constraint: O.Option<Type>
}

export interface Parameter {
  readonly name: string
  readonly type: Type
}

export interface Signature {
  readonly _tag: 'Signature'
  readonly typeParameters: ReadonlyArray<TypeParameter>
  readonly parameters: ReadonlyArray<Parameter>
  readonly returnType: Type
}

export interface TypeReference {
  readonly _tag: 'TypeReference'
  readonly name: string
  readonly typeArguments: ReadonlyArray<Type>
}

export interface Token {
  readonly _tag: 'Token'
}

export interface TypeOperator {
  readonly _tag: 'TypeOperator'
  readonly type: Type
}

export interface MappedType {
  readonly _tag: 'MappedType'
  readonly typeParameter: Type
  readonly type: O.Option<Type>
}

export interface UnionType {
  readonly _tag: 'UnionType'
  readonly members: ReadonlyArray<Type>
}

export interface TypeParameterDeclaration {
  readonly _tag: 'TypeParameterDeclaration'
  readonly name: string
  readonly constraint: O.Option<Type>
}

export interface ConditionalType {
  readonly _tag: 'ConditionalType'
  readonly checkType: Type
  readonly extendsType: Type
  readonly trueType: Type
  readonly falseType: Type
}

export interface IndexedAccessType {
  readonly _tag: 'IndexedAccessType'
  readonly objectType: Type
  readonly indexType: Type
}

export interface TupleType {
  readonly _tag: 'TupleType'
  readonly elements: ReadonlyArray<Type>
}

export interface RestType {
  readonly _tag: 'RestType'
  readonly type: Type
}

export interface LiteralType {
  readonly _tag: 'LiteralType'
}

export interface IntersectionType {
  readonly _tag: 'IntersectionType'
  readonly members: ReadonlyArray<Type>
}

export type Type =
  | Signature
  | Overloadings
  | TypeReference
  | Token
  | TypeOperator
  | MappedType
  | TypeParameterDeclaration
  | UnionType
  | ConditionalType
  | IndexedAccessType
  | TupleType
  | RestType
  | LiteralType
  | IntersectionType

export interface FunctionDeclaration {
  readonly name: string
  readonly overloadings: ReadonlyArray<Signature>
}

export interface File {
  readonly name: string
  readonly functions: ReadonlyArray<FunctionDeclaration>
}

// -------------------------------------------------------------------------------------
// parsers
// -------------------------------------------------------------------------------------

const ensureReadonlyArray = <A>(as: ReadonlyArray<A> | undefined): ReadonlyArray<A> => (as ? as : RA.empty)

export const parseType = (
  node: ast.ts.TypeNode | ast.ts.TypeParameterDeclaration | ast.ts.CallSignatureDeclaration
): Type => {
  if (ast.ts.isTypeReferenceNode(node)) {
    return {
      _tag: 'TypeReference',
      name: node.typeName.getText(),
      typeArguments: pipe(node.typeArguments, ensureReadonlyArray, RA.map(parseType))
    }
  }
  if (ast.ts.isFunctionTypeNode(node) || ast.ts.isCallSignatureDeclaration(node)) {
    return {
      _tag: 'Signature',
      typeParameters: pipe(node.typeParameters, ensureReadonlyArray, RA.map(parseTypeParameter)),
      parameters: pipe(node.parameters, RA.map(parseParameterDeclaration)),
      returnType: parseType(node.type!)
    }
  }
  if (ast.ts.isToken(node)) {
    return { _tag: 'Token' }
  }
  if (ast.ts.isTypeOperatorNode(node)) {
    return { _tag: 'TypeOperator', type: parseType(node.type) }
  }
  if (ast.ts.isMappedTypeNode(node)) {
    return {
      _tag: 'MappedType',
      typeParameter: parseType(node.typeParameter),
      type: pipe(node.type, O.fromNullable, O.map(parseType))
    }
  }
  if (ast.ts.isUnionTypeNode(node)) {
    return { _tag: 'UnionType', members: pipe(node.types, RA.map(parseType)) }
  }
  if (ast.ts.isTypeParameterDeclaration(node)) {
    return {
      _tag: 'TypeParameterDeclaration',
      name: node.name.getText(),
      constraint: pipe(node.constraint, O.fromNullable, O.map(parseType))
    }
  }
  if (ast.ts.isConditionalTypeNode(node)) {
    return {
      _tag: 'ConditionalType',
      checkType: parseType(node.checkType),
      extendsType: parseType(node.extendsType),
      trueType: parseType(node.trueType),
      falseType: parseType(node.falseType)
    }
  }
  if (ast.ts.isIndexedAccessTypeNode(node)) {
    return { _tag: 'IndexedAccessType', objectType: parseType(node.objectType), indexType: parseType(node.indexType) }
  }
  if (ast.ts.isTupleTypeNode(node)) {
    return { _tag: 'TupleType', elements: pipe(node.elements, RA.map(parseType)) }
  }
  if (ast.ts.isRestTypeNode(node)) {
    return { _tag: 'RestType', type: parseType(node.type) }
  }
  if (ast.ts.isLiteralTypeNode(node)) {
    return { _tag: 'LiteralType' }
  }
  if (ast.ts.isTypeLiteralNode(node)) {
    const members = node.members.filter(ast.ts.isCallSignatureDeclaration)
    return { _tag: 'Overloadings', signatures: pipe(members, RA.map(parseType)) }
  }
  if (ast.ts.isNamedTupleMember(node)) {
    return parseType(node.type)
  }
  if (ast.ts.isTypePredicateNode(node)) {
    return parseType(node.type!)
  }
  if (ast.ts.isIntersectionTypeNode(node)) {
    return { _tag: 'IntersectionType', members: pipe(node.types, RA.map(parseType)) }
  }
  throw new Error(`(parseType) not sure what to do with ${node.getText()}`)
}

export const parseTypeParameter = (tp: ast.ts.TypeParameterDeclaration): TypeParameter => {
  return {
    name: tp.name.getText(),
    constraint: pipe(tp.constraint, O.fromNullable, O.map(parseType))
  }
}

export const parseParameterDeclaration = (pd: ast.ts.ParameterDeclaration): Parameter => {
  return {
    name: pd.name.getText(),
    type: parseType(pd.type!)
  }
}

export const parseOverloading = (node: ast.ts.FunctionDeclaration): Signature => {
  return {
    _tag: 'Signature',
    typeParameters: pipe(node.typeParameters, ensureReadonlyArray, RA.map(parseTypeParameter)),
    parameters: pipe(node.parameters, RA.map(parseParameterDeclaration)),
    returnType: parseType(node.type!)
  }
}

export const parseFunctionDeclaration = (fd: ast.FunctionDeclaration): FunctionDeclaration => {
  const name = fd.getName()!
  return {
    name,
    overloadings: pipe(
      [...fd.getOverloads(), fd],
      RA.map((fd) => parseOverloading(fd.compilerNode))
    )
  }
}

export const parseFile = (src: ast.SourceFile): File => {
  const name = path.basename(src.getFilePath())
  return {
    name,
    functions: pipe(src.getFunctions(), RA.map(parseFunctionDeclaration))
  }
}

// -------------------------------------------------------------------------------------
// linters
// -------------------------------------------------------------------------------------

export interface Lint {
  readonly path: string
  readonly typeParameters: ReadonlyArray<string>
  readonly typeArguments: ReadonlyArray<string>
}

export const lint = (
  path: string,
  typeParameters: ReadonlyArray<string>,
  typeArguments: ReadonlyArray<string>
): Lint => ({ path, typeParameters, typeArguments })

const LintMonoid: M.Monoid<Lint> = M.struct({
  path: string.Monoid,
  typeParameters: RA.getMonoid(),
  typeArguments: RA.getMonoid()
})

export const append = (bs: ReadonlyArray<Lint>) => (a: Lint): ReadonlyArray<Lint> => {
  return pipe(
    bs,
    RA.match(
      () => [a],
      RA.map((b) => pipe(a, LintMonoid.concat(b)))
    )
  )
}

export const getTypeParameters = (type: Type): ReadonlyArray<string> => {
  switch (type._tag) {
    case 'TypeReference':
      return RA.empty
  }
  throw new Error(`(getTypeParameters) not sure what to do with ${type._tag}`)
}

export const getTypeArguments = (type: Type): ReadonlyArray<string> => {
  switch (type._tag) {
    case 'TypeReference':
      return pipe(
        type.typeArguments,
        RA.match(
          () => [type.name],
          (types) => pipe([type.name], RA.concat(pipe(types, RA.chain(getTypeArguments))))
        )
      )
    case 'Signature': {
      const typeParameters = pipe(
        type.typeParameters,
        RA.chain((tp) =>
          pipe(
            tp.constraint,
            O.map((t) => pipe(getTypeArguments(t), RA.prepend(tp.name))),
            O.getOrElse<ReadonlyArray<string>>(() => [tp.name])
          )
        )
      )
      const typeArguments = pipe(
        type.parameters,
        RA.chain((p) => getTypeArguments(p.type))
      )
      return pipe(typeParameters, RA.concat(typeArguments), RA.concat(getTypeArguments(type.returnType)))
    }
    case 'TypeOperator':
    case 'RestType':
      return getTypeArguments(type.type)
    case 'MappedType':
      return pipe(
        type.type,
        O.map(getTypeArguments),
        O.getOrElse<ReadonlyArray<string>>(() => RA.empty)
      )
    case 'ConditionalType':
      return pipe(
        getTypeArguments(type.checkType),
        RA.concat(getTypeArguments(type.extendsType)),
        RA.concat(getTypeArguments(type.trueType)),
        RA.concat(getTypeArguments(type.falseType))
      )
    case 'IndexedAccessType':
      return pipe(getTypeArguments(type.objectType), RA.concat(getTypeArguments(type.indexType)))
    case 'TupleType':
      return pipe(type.elements, RA.chain(getTypeArguments))
    case 'LiteralType':
    case 'Token':
      return RA.empty
    case 'UnionType':
    case 'IntersectionType':
      return pipe(type.members, RA.chain(getTypeArguments))
  }
  throw new Error(`(getTypeArguments) not sure what to do with ${type._tag}`)
}

export const lintType = (type: Type, path: string = string.empty): ReadonlyArray<Lint> => {
  switch (type._tag) {
    case 'TypeReference':
      return [pipe(lint(path, getTypeParameters(type), getTypeArguments(type)))]
    case 'Signature':
      return lintSignature(path, type)
    case 'Overloadings':
      return pipe(
        type.signatures,
        RA.chainWithIndex((i, t) => lintType(t, `/${String(i)}`))
      )
    case 'TypeOperator':
      return lintType(type.type, path)
    case 'TupleType':
      return pipe(
        type.elements,
        RA.chain((t) => lintType(t, path))
      )
    case 'IndexedAccessType':
      return pipe(lintType(type.objectType, path), RA.concat(lintType(type.indexType, path)))
    case 'LiteralType':
    case 'Token':
      return RA.empty
  }
  throw new Error(`(lintType) not sure what to do with ${type._tag}`)
}

export const lintSignature = (path: string, s: Signature): ReadonlyArray<Lint> => {
  return pipe(
    lint(
      path,
      pipe(
        s.typeParameters,
        RA.map((tp) => tp.name)
      ),
      pipe(
        s.parameters,
        RA.chain((p) => getTypeArguments(p.type))
      )
    ),
    append(lintType(s.returnType))
  )
}

export const lintFunction = (filename: string, fd: FunctionDeclaration): ReadonlyArray<Lint> => {
  return pipe(
    fd.overloadings,
    RA.chainWithIndex((i, s) => lintSignature(`${filename}/${fd.name}/${i}`, s))
  )
}

export const lintFile = (file: File): ReadonlyArray<Lint> => {
  const functions = file.functions // .filter((f) => f.name === 'reduceE')
  return pipe(
    functions,
    RA.chain((f) => lintFunction(file.name, f))
  )
}

const eq = RA.getEq(string.Eq)
const intersection = RA.intersection(string.Eq)
const uniq = RA.uniq(string.Eq)

export const check = (lints: ReadonlyArray<Lint>): ReadonlyArray<string> => {
  return pipe(
    lints,
    RA.map((l) => ({
      path: l.path,
      typeParameters: l.typeParameters,
      typeArguments: pipe(l.typeArguments, intersection(l.typeParameters), uniq)
    }))
  )
    .filter((l) => {
      return !pipe(l.typeParameters, eq.equals(l.typeArguments))
    })
    .map(
      (l) => `Type Parameter Order Error in ${l.path}: ${l.typeParameters.join(', ')} !== ${l.typeArguments.join(', ')}`
    )
}

// -------------------------------------------------------------------------------------
// main
// -------------------------------------------------------------------------------------

export const compilerOptions: ast.ProjectOptions['compilerOptions'] = {
  strict: true
}

export const project = new ast.Project({
  compilerOptions
})

export const paths = glob.sync('src/**/*.ts')
paths.forEach((path) => project.addSourceFileAtPath(path))
const files = pipe(project.getSourceFiles(), RA.map(parseFile))
const checks = pipe(
  files,
  RA.chain((f) => check(lintFile(f)))
)
console.log(JSON.stringify(checks, null, 2))

// project.addSourceFileAtPath('src/Bifunctor.ts')
// export const file = parseFile(project.getSourceFiles()[0])
// // console.log(JSON.stringify(file.functions, null, 2))
// console.log(JSON.stringify(check(lintFile(file)), null, 2))
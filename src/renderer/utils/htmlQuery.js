const Id = (name) => {
    return document.getElementById(name)
}

const ClassName = (name) => {
    return document.getElementsByClassName(name)
}

const ClassNameSingle = (name, index=0) => {
    return document.getElementsByClassName(name)[index]
}

const TagName = (name) => {
    return document.getElementsByTagName(name)
}

const TagNameSingle = (name, index=0) => {
    return document.getElementsByTagName(name)[index]
}

const QuerySelectorAll = (name) => {
    return document.querySelectorAll(name)
}

const CreateElm = (name) => {
    return document.createElement(name)
}

module.exports = { Id, ClassName, ClassNameSingle, TagName, TagNameSingle, QuerySelectorAll, CreateElm }

const Id = (name) => {
    return document.getElementById(name)
}

const ClassName = (name) => {
    return document.getElementsByClassName(name)
}

const ClassNameSingle = (name) => {
    return document.getElementsByClassName(name)[0]
}

const TagName = (name) => {
    return document.getElementsByTagName(name)
}

const TagNameSingle = (name) => {
    return document.getElementsByTagName(name)[0]
}

const QuerySelectorAll = (name) => {
    return document.querySelectorAll(name)
}

const CreateElm = (name) => {
    return document.createElement(name)
}

module.exports = { Id, ClassName, ClassNameSingle, TagName, TagNameSingle, QuerySelectorAll, CreateElm }
